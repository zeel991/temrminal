"use client";

import { useAccount, useBalance } from "wagmi";

const Balance = () => {
  const { address } = useAccount();
  const { data, isError, isLoading } = useBalance({ address });

  if (isLoading) return <div className="text-black">Fetching balance…</div>;
  if (isError)
    return <div className="text-red-500">Error fetching balance</div>;

  return (
    <>
      <h2 className="mt-6 text-2xl text-black">useBalance</h2>
      {data && (
        <p className="text-black">
          Balance: {data.formatted} {data.symbol}
        </p>
      )}
    </>
  );
};

export default Balance;
