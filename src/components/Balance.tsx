'use client';

import {useAccount, useBalance} from 'wagmi';
import Token from './Token';

const Balance = () => {
  const {address} = useAccount();
  const {data, isError, isLoading} = useBalance({address});

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return (
    <>
      <h2 className="mt-6 text-2xl text-black">useBalance</h2>
      {isLoading && <p>fetching balance...</p>}
      {isError && <p>Error fetching balance.</p>}
      {data && (
        <p className="text-black">
          Balance: {data?.formatted} {data?.symbol}
        </p>
      )}
    </>
  );
};

export default Balance;