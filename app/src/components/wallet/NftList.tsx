"use client"

import { useState, useMemo } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface NFTItem {
  id: string;
  name: string;
  tokenId: string;
  contractAddress: string;
  image?: string;
  collection: string;
  chainId: number;
  description?: string;
  lastPrice?: string;
  floorPrice?: string;
}

interface NftListProps {
  className?: string;
  compact?: boolean;
}


function NftListItem({ nft, compact = false }: { nft: NFTItem; compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
        <Avatar className="size-10 rounded-lg">
          <AvatarImage src={nft.image} alt={nft.name} className="object-cover" />
          <AvatarFallback className="text-xs rounded-lg">
            NFT
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="font-medium text-foreground text-sm truncate">
            {nft.name}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {nft.collection}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-medium text-foreground">
            {nft.lastPrice}
          </div>
          <div className="text-xs text-muted-foreground">
            Floor: {nft.floorPrice}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors cursor-pointer">
      <div className="aspect-square relative mb-3 rounded-lg overflow-hidden bg-muted">
        {nft.image ? (
          <Avatar className="w-full h-full rounded-lg">
            <AvatarImage src={nft.image} alt={nft.name} className="object-cover w-full h-full" />
            <AvatarFallback className="w-full h-full rounded-lg flex items-center justify-center">
              <Icon name="image" size={32} className="text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="image" size={32} className="text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div>
          <h3 className="font-semibold text-foreground text-sm truncate">
            {nft.name}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {nft.collection}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Last Price</span>
            <span className="font-medium text-foreground">{nft.lastPrice}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Floor</span>
            <span className="text-muted-foreground">{nft.floorPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NftList({ className = '', compact = false }: NftListProps) {
  const [isLoading] = useState(false);

  const nfts = useMemo(() => {
    // TODO: Implement actual NFT fetching from Cross Wallet SDK
    return [];
  }, []);

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: compact ? 5 : 6 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "animate-pulse bg-muted rounded-lg",
              compact ? "h-16" : "h-64"
            )}
          />
        ))}
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Icon name="image" size={32} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">No NFTs Found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your NFT collection will appear here
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn('space-y-1', className)}>
        {nfts.map((nft) => (
          <NftListItem key={nft.id} nft={nft} compact />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4', className)}>
      {nfts.map((nft) => (
        <NftListItem key={nft.id} nft={nft} />
      ))}
    </div>
  );
}

export default NftList;