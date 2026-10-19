export interface Question {
  id: number;
  text: string;
  options: { value: string; label: string }[];
  type?: "radio" | "text" | "scale";
  variant?: "A" | "B" | "C";
  explanation?: string;
}

export interface KesiapanQuestion {
  id: number;
  text: string;
  labelMin: string;
  labelMax: string;
  isReverse?: boolean;
}

export interface KesiapanSection {
  section: string;
  items: KesiapanQuestion[];
}

export interface KepribadianQuestion {
  id: number;
  text: string;
  group?: string;
  isReverse?: boolean;
  isControl?: boolean;
  labelMin?: string;
  labelMax?: string;
  // Backward compatibility
  optionA?: string;
  optionB?: string;
}

export interface KepribadianSection {
  section: string;
  items: KepribadianQuestion[];
}
