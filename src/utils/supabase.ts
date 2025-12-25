import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface CredentialRecord {
  id: string;
  token_id: string;
  student_address: string;
  institution_name: string;
  institution_address: string;
  degree: string; 
  ipfs_hash: string;
  issue_date: string;
  revoked: boolean;
  created_at: string;
  updated_at: string;
}

export interface CredentialShare {
  id: string;
  credential_id: string;
  shared_with: string;
  share_token: string;
  expires_at: string;
  access_count: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  credential_id: string;
  action: string;
  actor_address: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface StudentProfile {
  id: string;
  wallet_address: string;
  full_name: string;
  email: string;
  institution_name: string;
  institution_address: string;
  enrollment_date: string;
  created_at: string;
  updated_at: string;
}

export const saveCredential = async (
  tokenId: string,
  studentAddress: string,
  institutionName: string,
  institutionAddress: string,
  degree: string,
  ipfsHash: string,
  issueDate: Date
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('credentials')
      .insert({
        token_id: tokenId,
        student_address: studentAddress,
        institution_name: institutionName,
        institution_address: institutionAddress,
        degree: degree,
        ipfs_hash: ipfsHash,
        issue_date: issueDate.toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;

    await logAuditEvent(
      data.id,
      'issued',
      institutionAddress,
      { tokenId, degree, institutionName }
    );

    return data.id;
  } catch (error) {
    console.error('Error saving credential:', error);
    return null;
  }
};

export const getCredentialsByStudent = async (
  studentAddress: string
): Promise<CredentialRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('credentials')
      .select('*')
      .eq('student_address', studentAddress)
      .order('issue_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return [];
  }
};

export const getCredentialsByInstitution = async (
  institutionAddress: string
): Promise<CredentialRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('credentials')
      .select('*')
      .eq('institution_address', institutionAddress)
      .order('issue_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return [];
  }
};

export const createShareToken = async (
  credentialId: string,
  sharedWith: string,
  expiresInHours: number = 24
): Promise<string | null> => {
  try {
    const shareToken = `share_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const { error } = await supabase
      .from('credential_shares')
      .insert({
        credential_id: credentialId,
        shared_with: sharedWith,
        share_token: shareToken,
        expires_at: expiresAt.toISOString(),
      });

    if (error) throw error;

    await logAuditEvent(
      credentialId,
      'shared',
      sharedWith,
      { expiresAt: expiresAt.toISOString() }
    );

    return shareToken;
  } catch (error) {
    console.error('Error creating share token:', error);
    return null;
  }
};

export const getCredentialByShareToken = async (
  shareToken: string
): Promise<CredentialRecord | null> => {
  try {
    const { data: shareData, error: shareError } = await supabase
      .from('credential_shares')
      .select('credential_id, access_count')
      .eq('share_token', shareToken)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (shareError) throw shareError;
    if (!shareData) return null;

    await supabase
      .from('credential_shares')
      .update({ access_count: shareData.access_count + 1 })
      .eq('share_token', shareToken);

    const { data: credData, error: credError } = await supabase
      .from('credentials')
      .select('*')
      .eq('id', shareData.credential_id)
      .maybeSingle();

    if (credError) throw credError;

    if (credData) {
      await logAuditEvent(
        credData.id,
        'verified',
        'share_token_access',
        { shareToken }
      );
    }

    return credData;
  } catch (error) {
    console.error('Error fetching credential by share token:', error);
    return null;
  }
};

export const logAuditEvent = async (
  credentialId: string,
  action: string,
  actorAddress: string,
  metadata: Record<string, any> = {}
): Promise<void> => {
  try {
    await supabase
      .from('audit_logs')
      .insert({
        credential_id: credentialId,
        action,
        actor_address: actorAddress,
        metadata,
      });
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
};

export const getAuditLogs = async (
  credentialId: string
): Promise<AuditLog[]> => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('credential_id', credentialId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
};

export const revokeCredential = async (
  tokenId: string,
  actorAddress: string
): Promise<boolean> => {
  try {
    const { data: credData, error: credError } = await supabase
      .from('credentials')
      .select('id')
      .eq('token_id', tokenId)
      .maybeSingle();

    if (credError) throw credError;
    if (!credData) return false;

    const { error: updateError } = await supabase
      .from('credentials')
      .update({ revoked: true })
      .eq('token_id', tokenId);

    if (updateError) throw updateError;

    await logAuditEvent(
      credData.id,
      'revoked',
      actorAddress,
      { tokenId }
    );

    return true;
  } catch (error) {
    console.error('Error revoking credential:', error);
    return false;
  }
};

export const getInstitutionStats = async (
  institutionAddress: string
): Promise<{
  totalIssued: number;
  totalRevoked: number;
  recentIssued: number;
}> => {
  try {
    const { data: allCreds, error: allError } = await supabase
      .from('credentials')
      .select('revoked, issue_date')
      .eq('institution_address', institutionAddress);

    if (allError) throw allError;

    const totalIssued = allCreds?.length || 0;
    const totalRevoked = allCreds?.filter(c => c.revoked).length || 0;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const recentIssued = allCreds?.filter(
      c => new Date(c.issue_date) > lastMonth
    ).length || 0;

    return { totalIssued, totalRevoked, recentIssued };
  } catch (error) {
    console.error('Error fetching institution stats:', error);
    return { totalIssued: 0, totalRevoked: 0, recentIssued: 0 };
  }
};

export const getStudentProfile = async (
  walletAddress: string
): Promise<StudentProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return null;
  }
};

export const createStudentProfile = async (
  walletAddress: string,
  fullName: string,
  email: string,
  institutionName: string,
  institutionAddress: string
): Promise<StudentProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .insert({
        wallet_address: walletAddress,
        full_name: fullName,
        email,
        institution_name: institutionName,
        institution_address: institutionAddress,
        enrollment_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating student profile:', error);
    return null;
  }
};

export const updateStudentProfile = async (
  walletAddress: string,
  updates: {
    full_name?: string;
    email?: string;
    institution_name?: string;
    institution_address?: string;
  }
): Promise<StudentProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .update(updates)
      .eq('wallet_address', walletAddress)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating student profile:', error);
    return null;
  }
};

export const getAuthorizedInstitutions = async (): Promise<Array<{ address: string; name: string }>> => {
  try {
    const { data, error } = await supabase
      .from('institution_authorization_requests')
      .select('wallet_address, institution_name')
      .eq('status', 'approved');

    if (error) throw error;

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(inst => ({
      address: inst.wallet_address,
      name: inst.institution_name
    }));
  } catch (error) {
    console.error('Error fetching authorized institutions:', error);
    return [];
  }
};

export const getInstitutionStudents = async (
  institutionAddress: string
): Promise<StudentProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('institution_address', institutionAddress)
      .order('enrollment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching institution students:', error);
    return [];
  }
};
