import { useEffect, useRef, useState } from "react";

function useTimer(period: number) {
  const [reload, setreload] = useState(period);

  const timer = useRef(0);

  const SetTimerRestart = () => {
    clearInterval(timer.current);
    setreload(period);
    timer.current = setInterval(() => {
      setreload((prev) => prev - 1);
    }, 1000);
  };

  useEffect(() => {
    timer.current = setInterval(() => {
      setreload((prev) => prev - 1);
    }, 1000);
  }, []);

  return { reload, SetTimerRestart };
}

export default useTimer;
