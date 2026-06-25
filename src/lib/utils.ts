export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];
