import React from 'react'

export interface RuntimeShellProps {
  sidebar: React.ReactNode
  workspace: React.ReactNode
}

export function RuntimeShell(props: RuntimeShellProps) {
  return (
    <div className="runtime-shell">
      <aside className="runtime-sidebar">{props.sidebar}</aside>

      <main className="runtime-workspace">
        {props.workspace}
      </main>
    </div>
  )
}
