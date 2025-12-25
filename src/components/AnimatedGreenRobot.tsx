import { motion } from "framer-motion";

interface AnimatedGreenRobotProps {
  size?: number;
  color?: string;
  animationSpeed?: number;
}

export default function AnimatedGreenRobot({
  size = 1000,
  color = "#00FF00",
  animationSpeed = 2,
}: AnimatedGreenRobotProps) {
  return (
    <div
      style={{
        display: "none", // 👈 completely hides it
      }}
    />
  );
}
