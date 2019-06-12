import { useState } from "react";

export default function useInput(): [string, (e: any) => void] {
  const [value, setvalue] = useState("");
  const input = (e: any) => {
    setvalue(e.target.value);
  };

  return [value, input];
}
