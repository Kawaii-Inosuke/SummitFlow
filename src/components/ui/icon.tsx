type IconVariant = "orange" | "gray" | "dark";

interface IconProps {
  name: string;
  variant?: IconVariant;
  size?: number;
  className?: string;
}

const VARIANT_MAP: Record<IconVariant, { folder: string; suffix: string }> = {
  orange: { folder: "EC5B13", suffix: "1" },
  gray: { folder: "94A3B8", suffix: "2" },
  dark: { folder: "0F172A", suffix: "3" },
};

export function Icon({ name, variant = "gray", size = 20, className = "" }: IconProps) {
  const { folder, suffix } = VARIANT_MAP[variant];
  const src = `/icons/${folder}/${name} ${suffix}.svg`;

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={className}
      draggable={false}
    />
  );
}
