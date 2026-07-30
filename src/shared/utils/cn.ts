type ClassValue = string | false | null | undefined | { [key: string]: boolean | null | undefined };

export function cn(...classes: ClassValue[]): string {
  const result: string[] = [];
  for (const cls of classes) {
    if (!cls) continue;
    if (typeof cls === "string") {
      result.push(cls);
    } else {
      for (const key in cls) {
        if (cls[key]) result.push(key);
      }
    }
  }
  return result.join(" ");
}
