import React from 'react';
import { Button } from '@/components/ui/button';

export function ButtonExamples() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">버튼 컴포넌트 예시</h1>

      {/* 기본 버튼들 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Variants (변형)</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">기본 버튼</Button>
          <Button variant="destructive">삭제 버튼</Button>
          <Button variant="outline">아웃라인 버튼</Button>
          <Button variant="secondary">보조 버튼</Button>
          <Button variant="ghost">고스트 버튼</Button>
          <Button variant="link">링크 버튼</Button>
        </div>
      </section>

      {/* 크기별 버튼들 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Sizes (크기)</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">작은 버튼</Button>
          <Button size="default">기본 버튼</Button>
          <Button size="lg">큰 버튼</Button>
          <Button size="icon">🏠</Button>
        </div>
      </section>

      {/* 상태별 버튼들 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">States (상태)</h2>
        <div className="flex flex-wrap gap-4">
          <Button>일반 상태</Button>
          <Button disabled>비활성화</Button>
        </div>
      </section>

      {/* 기능 예시 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Interactive Examples (상호작용 예시)</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => alert('클릭됨!')}>
            클릭해보세요
          </Button>
          <Button variant="outline" onClick={() => console.log('콘솔 로그')}>
            콘솔 로그
          </Button>
          <Button variant="secondary" disabled>
            비활성화 버튼
          </Button>
        </div>
      </section>

      {/* 조합 예시 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Combinations (조합)</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="destructive" size="sm">
            작은 삭제
          </Button>
          <Button variant="outline" size="lg">
            큰 아웃라인
          </Button>
          <Button variant="ghost" size="icon">
            ⚙️
          </Button>
        </div>
      </section>
    </div>
  );
}

export default ButtonExamples;