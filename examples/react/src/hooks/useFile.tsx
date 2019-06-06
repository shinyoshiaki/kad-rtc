import { useState } from "react";

export default function useFile(): [File, (e: any) => void] {
  const [value, setvalue] = useState();
  const input = (e: any) => {
    setvalue(e.target.files[0]);
  };

  return [value, input];
}
