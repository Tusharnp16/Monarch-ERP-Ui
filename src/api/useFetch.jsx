import { useState, useEffect } from "react";
import API from "./AxiosConfig";
import axios from "axios";

const useFetch = (url) => {
  //   const urll = null;
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const funnyErrors = [
    "Our digital hamsters are currently on a union-mandated snack break.",
    "The servers are having a mid-life crisis. Please be patient.",
    "Well, this is awkward. The internet just sneezed.",
    "Great Scott! We've hit a temporal anomaly in the product catalog.",
    "It's not you, it's us. We're currently questioning our life choices.",
    "It's not you, it's us. Actually, it's definitely us.",
    "Houston, we have a problem. And by 'problem', we mean this button is broken.",
  ];

  useEffect(() => {
    const source = axios.CancelToken.source();

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await API.get(url, { cancelToken: source.token });
        setData(response.data);
        setError(null);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Request canceled");
        } else {
          setError(funnyErrors[Math.floor(Math.random() * funnyErrors.length)]);
          console.error("Fetch error:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => source.cancel("Component unmounted");
  }, [url]);

  return { data, isLoading, error };
};

export default useFetch;
