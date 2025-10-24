'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function DailyReportTestPage() {
  const [date, setDate] = useState('')
  const [format, setFormat] = useState('json')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const testBasicAPI = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const url = `/api/daily-report?format=${format}${date ? `&date=${date}` : ''}`
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'API 호출 실패')
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const testN8nAPI = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/n8n/daily-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: date || undefined,
          format: format,
          recipients: ['test@example.com']
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'API 호출 실패')
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const openHTMLInNewTab = () => {
    if (result?.data?.html) {
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write(result.data.html)
        newWindow.document.close()
      }
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ara Insight 데일리 리포트 API 테스트</h1>
        <p className="text-gray-600">
          데일리 리포트 API를 테스트하고 HTML 리포트를 미리 볼 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 기본 API 테스트 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 API 테스트</CardTitle>
            <CardDescription>
              GET /api/daily-report 엔드포인트를 테스트합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="date">날짜 (YYYY-MM-DD)</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="비워두면 오늘 날짜 사용"
              />
            </div>
            
            <div>
              <Label htmlFor="format">응답 형식</Label>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="json">JSON</option>
                <option value="html">HTML</option>
              </select>
            </div>

            <Button 
              onClick={testBasicAPI} 
              disabled={loading}
              className="w-full"
            >
              {loading ? '로딩 중...' : '기본 API 테스트'}
            </Button>
          </CardContent>
        </Card>

        {/* n8n API 테스트 */}
        <Card>
          <CardHeader>
            <CardTitle>n8n API 테스트</CardTitle>
            <CardDescription>
              POST /api/n8n/daily-report 엔드포인트를 테스트합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="n8n-date">날짜 (YYYY-MM-DD)</Label>
              <Input
                id="n8n-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="비워두면 오늘 날짜 사용"
              />
            </div>
            
            <div>
              <Label htmlFor="n8n-format">응답 형식</Label>
              <select
                id="n8n-format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="json">JSON</option>
                <option value="html">HTML</option>
              </select>
            </div>

            <Button 
              onClick={testN8nAPI} 
              disabled={loading}
              className="w-full"
            >
              {loading ? '로딩 중...' : 'n8n API 테스트'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 결과 표시 */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600">
              <strong>오류:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>API 응답 결과</CardTitle>
            <CardDescription>
              API 호출 결과입니다. HTML 형식인 경우 새 탭에서 미리보기를 볼 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {format === 'html' && result.data?.html && (
              <div className="mb-4">
                <Button onClick={openHTMLInNewTab} variant="outline">
                  HTML 리포트 새 탭에서 보기
                </Button>
              </div>
            )}
            
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 사용법 안내 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>API 사용법</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. 기본 API (GET)</h3>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
              GET /api/daily-report?format=html&date=2025-10-17
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">2. n8n API (POST)</h3>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
              POST /api/n8n/daily-report<br/>
              Content-Type: application/json<br/>
              {JSON.stringify({
                date: "2025-10-17",
                format: "html",
                recipients: ["admin@example.com"]
              }, null, 2)}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. n8n 워크플로우 설정</h3>
            <p className="text-sm text-gray-600">
              자세한 n8n 워크플로우 설정 방법은 <code>docs/n8n-daily-report-setup.md</code> 파일을 참조하세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
