'use client'
import { useState } from 'react';
import UserDeals from '@/components/UserDeals';
import ProviderDeals from '@/components/ProviderDeals';

export default function Main() {
  const [type, setType] = useState<'user' | 'provider'>('provider');

  return (
    <div className="flex flex-col items-center size-full">
      {type === 'user' ? <UserDeals /> : <ProviderDeals />}
    </div>
  );
}
