# Runtime Kernel Analysis

## Scope

This document analyzes the actual runtime kernel structure currently operating inside archive-os.

Primary targets:

- bootstrap.js
- router.js
- workspace shell
- screen registry
- runtime mounting flow
- navigation orchestration

Goal:

Understand the runtime execution chain before stabilization refactors.

---

# 1. Runtime Boot Sequence

Observed startup flow:

```text
index.html
→ bootstrap.js
→ database initialization
→ seed initialization
→ realtime engine
→ runtime shell
→ route mount
→ screen render
```

Current startup logs confirm:

```text
UI Started
DOM READY
DB Connected
System initialized
Realtime engine started
COCKPIT READY
```

This means:

The runtime kernel itself is operational.

---

# 2. bootstrap.js Analysis

bootstrap.js currently acts as:

| Responsibility | Status |
|---|---|
| runtime initialization | active |
| db startup | active |
| realtime startup | active |
| shell mounting | active |
| route initialization | partial |
| error isolation | weak |
| dependency injection | missing |

Critical issue:

bootstrap currently knows too much.

It directly coordinates:

- database
- realtime
- runtime shell
- UI mounting
- startup telemetry

Instead of delegating to:

```text
runtime container
```

---

# 3. Runtime Router Analysis

Current router behavior:

```text
route
→ screen render
→ direct UI mount
```

Problems observed:

## 3.1 Router tightly coupled to screens

Router currently imports screens directly.

This creates:

- circular dependency risk
- runtime fragility
- hardcoded navigation
- screen duplication problems

---

## 3.2 No canonical route registry

Routes exist implicitly.

Not through:

```text
canonical runtime manifest
```

Consequences:

- orphan screens
- dead routes
- duplicate routes
- hidden modules
- impossible permission enforcement

---

# 4. Workspace Shell Analysis

Current shell already supports:

- sidebar
- topbar
- runtime mounting
- active workspace
- dock-like behavior
- persistent navigation

Architecturally this is strong.

The shell is one of the healthiest runtime areas.

---

# 5. Screen Registry Analysis

Current registry behavior is fragmented.

Some screens are:

- registered manually
- mounted directly
- rendered through runtime
- partially hardcoded

Observed issue:

```text
screens currently behave like isolated mini-applications
```

instead of:

```text
runtime-managed workspaces
```

---

# 6. Runtime State Ownership

Current ownership split:

| State | Owner |
|---|---|
| workspace state | shell |
| navigation state | router |
| business state | screens |
| persistence state | repos |
| intelligence state | mixed |
| realtime state | engine |

Problem:

No centralized runtime container exists.

---

# 7. Render Flow Problems

Current render pattern:

```text
screen
→ querySelector
→ mutate DOM
→ update UI
```

Observed failures:

```text
Cannot set properties of null
```

This proves:

render lifecycle is not protected.

Root causes:

- mount race conditions
- missing DOM guards
- direct DOM mutation
- screen-local orchestration

---

# 8. Runtime Architectural Risk

Current architecture:

```text
screen-centric runtime
```

instead of:

```text
runtime-centric screen orchestration
```

Meaning:

The runtime hosts screens,

but screens still control too much of the runtime.

---

# 9. Canonical Runtime Direction

Target architecture:

```text
Runtime Kernel
 ├── Route Registry
 ├── Workspace Manager
 ├── Event Bus
 ├── Runtime State
 ├── Service Container
 ├── Screen Mount Engine
 ├── Runtime Notifications
 ├── Runtime Recovery Engine
 └── Workspace Persistence
```

Then:

```text
screens become runtime plugins
```

not isolated systems.

---

# 10. Required Stabilization Tasks

## Phase 1 — Registry Stabilization

Build:

```text
canonical-screen-registry
```

Containing:

- id
- route
- owner domain
- permissions
- workspace type
- dependencies
- runtime flags

---

## Phase 2 — Runtime Container

Create:

```text
runtime container
```

to own:

- services
- repos
- runtime state
- orchestration
- event injection

---

## Phase 3 — Mount Protection

Introduce:

- DOM guards
- lifecycle protection
- mount validation
- render isolation

---

## Phase 4 — Screen Decoupling

Screens must stop:

- mutating persistence directly
- controlling orchestration
- calculating business truth

Screens become:

```text
runtime views only
```

---

# 11. Runtime Health Status

| Layer | Status |
|---|---|
| shell | healthy |
| navigation | operational |
| bootstrap | overloaded |
| screen registry | fragmented |
| rendering | fragile |
| orchestration | mixed |
| lifecycle protection | weak |
| runtime persistence | partial |

---

# 12. Conclusion

archive-os already contains:

- real runtime concepts
- operational workspace ideas
- persistent navigation philosophy
- offline-first direction
- modular runtime potential

The current challenge is not invention.

The challenge is:

```text
runtime consolidation
```

The runtime must become:

```text
kernel-first
```

instead of:

```text
screen-first
```

This transition is now underway.
