"use client"

import { useState, useCallback } from 'react';
import { CompactTokenList } from './CompactTokenList';
import { TokenDetailModal } from './TokenDetailModal';
import { SendTokenModal } from './SendTokenModal';
import type { TokenWithChainInfo } from '@/types/crossWallet';

interface CompactTokenListWithModalProps {
  className?: string;
  onSendClick?: (token: TokenWithChainInfo) => void;
  showPercentChange?: boolean;
  compact?: boolean;
  maxItems?: number;
  showSendButtons?: boolean;
}

export function CompactTokenListWithModal({
  className = '',
  onSendClick,
  showPercentChange = true,
  compact = false,
  maxItems,
  showSendButtons = true
}: CompactTokenListWithModalProps) {
  const [selectedToken, setSelectedToken] = useState<TokenWithChainInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [sendToken, setSendToken] = useState<TokenWithChainInfo | null>(null);

  // 토큰 클릭 핸들러 - 모달 열기
  const handleTokenClick = useCallback((token: TokenWithChainInfo) => {
    setSelectedToken(token);
    setIsModalOpen(true);
  }, []);

  // 모달 닫기 핸들러
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedToken(null);
  }, []);

  // 송금 클릭 핸들러
  const handleSendClick = useCallback((token: TokenWithChainInfo) => {
    if (onSendClick) {
      onSendClick(token);
    } else {
      // 기본 동작: 송금 모달 표시
      setSendToken(token);
      setIsSendModalOpen(true);
      // 기존 모달이 열려있다면 닫기
      setIsModalOpen(false);
    }
  }, [onSendClick]);

  // 송금 모달 닫기 핸들러
  const handleCloseSendModal = useCallback(() => {
    setIsSendModalOpen(false);
    setSendToken(null);
  }, []);

  return (
    <>
      <CompactTokenList
        className={className}
        onTokenClick={handleTokenClick}
        onSendClick={handleSendClick}
        showPercentChange={showPercentChange}
        compact={compact}
        maxItems={maxItems}
        showSendButtons={showSendButtons}
      />

      <TokenDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        token={selectedToken}
        onSendClick={handleSendClick}
      />

      <SendTokenModal
        isOpen={isSendModalOpen}
        onClose={handleCloseSendModal}
        token={sendToken}
      />
    </>
  );
}

export default CompactTokenListWithModal;