import { useEffect, useRef, useState } from "preact/hooks";

export interface UseAsyncOptions<A> {
  immediate?: boolean;
  arg?: A;
}

export interface UseAsyncReturn<T, A> {
  value?: T;
  error?: any;
  isFetching: boolean;
  isResolved: boolean;
  invoke: (arg: A) => void;
}

export function useAsync<T, A = void>(
  fn: (arg: A) => Promise<T>,
  { immediate = false, arg }: UseAsyncOptions<A> = {},
): UseAsyncReturn<T, A> {
  const promiseRef = useRef<Promise<T>>();
  const [isFetching, setIsFetching] = useState(immediate);
  const [isResolved, setIsResolved] = useState(false);
  const [value, setValue] = useState<T>();
  const [error, setError] = useState();

  const invoke = (arg: A) => {
    let promise = promiseRef.current ?? fn(arg);
    promiseRef.current = promise;

    setIsFetching(true);
    promise
      .then((data: T) => {
        setValue(data);
        setIsResolved(true);
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => {
        promiseRef.current = undefined;
        setIsFetching(false);
      });
  };

  useEffect(() => {
    if (immediate) {
      invoke(arg!);
    }
  }, []);

  return {
    value,
    error,
    isFetching,
    isResolved,
    invoke: immediate ? () => {} : invoke,
  };
}
