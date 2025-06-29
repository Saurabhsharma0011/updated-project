"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Wifi, WifiOff, Code } from "lucide-react"

interface ConnectionStatusProps {
  isConnected: boolean
  error: string | null
  rawMessages: any[]
}

export const ConnectionStatus = ({ isConnected, error, rawMessages }: ConnectionStatusProps) => {
  return (
    <div className="flex items-center gap-3">
      <Badge
        variant={isConnected ? "default" : "destructive"}
        className={`${isConnected ? "bg-green-600" : "bg-red-600"} text-white`}
      >
        {isConnected ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
        {isConnected ? "Connected" : "Disconnected"}
      </Badge>

      {error && <span className="text-red-400 text-sm">{error}</span>}

      {/* Raw WebSocket Data Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent border-slate-600 text-slate-400 hover:bg-slate-800"
          >
            <Code className="w-3 h-3 mr-1" />
            Raw Data
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Raw WebSocket Data</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="bg-slate-950 rounded-lg p-4 max-h-96 overflow-y-auto">
              {rawMessages.length > 0 ? (
                <div className="space-y-2">
                  {rawMessages.map((message, index) => (
                    <div key={index} className="border-b border-slate-800 pb-2 mb-2 last:border-b-0">
                      <div className="text-xs text-slate-400 mb-1">Message #{rawMessages.length - index}</div>
                      <pre className="text-xs text-green-400 whitespace-pre-wrap break-all">
                        {JSON.stringify(message, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No WebSocket messages received yet</p>
              )}
            </div>
            <div className="mt-4 text-xs text-slate-500">Showing latest {rawMessages.length} messages (max 20)</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
