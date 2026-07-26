# Expansion Plan: Touchscreen Arcade Collection

This plan details the addition of seven new HTML5 games to fully complete **The Arcade Hub** collection (replacing all 7 "Coming Soon" slots in `index.html`). Each proposed game is designed around **touchscreen interactions**, **uncomplicated physics**, and a **vibrant neon-dark aesthetic**.

---

## Proposed Game Additions

### 1. Neon Slasher (Swipe & Slice) — Slot 4
*   **Overview**: A fast-paced, swipe-to-slice action game inspired by classic fruit-slicing mechanics, tailored with a glowing vector style.
*   **Gameplay Loop**:
    *   Neon discs fly up from the bottom of the screen in parabolic trajectories.
    *   The player drags their finger across the screen to create a slicing trail.
    *   Slicing a disc splits it into two glowing halves that fall off-screen, adding points.
    *   Avoid slicing "volatile cores" (bombs), which trigger an instant game over.
*   **Touch Controls**: Touch drag to draw temporary path lines (swipe gesture).
*   **Uncomplicated Physics**:
    *   **Parabolic Trajectory**: Spawns with initial random vertical velocity ($v_y$) and horizontal velocity ($v_x$). Moves under constant downward gravity ($g$):
        $$x_{t+1} = x_t + v_x$$
        $$v_{y, t+1} = v_{y, t} + g$$
        $$y_{t+1} = y_t + v_{y, t}$$
    *   **Intersection Detection**: Checks if the segment of the player's swipe line intersects the circle boundary of the flying disc.

### 2. Flappy Neon (Thrust & Gravity) — Slot 5
*   **Overview**: A vertical obstacle-avoidance runner where players guide a glowing triangular spaceship through gaps in neon columns.
*   **Gameplay Loop**:
    *   The ship moves forward (the screen scrolls left) continuously.
    *   The player taps the screen to apply an upward thrust pulse.
    *   The ship must navigate through narrow openings between obstacles.
    *   Crashing into obstacles or the floor/ceiling resets the run.
*   **Touch Controls**: Single tap anywhere on the screen to jump/flap.
*   **Uncomplicated Physics**:
    *   **Thrust & Gravity**: The ship falls under constant gravity ($g$). Tapping resets the vertical velocity ($v_y$) to a fixed upward impulse (negative value):
        $$v_{y, t+1} = v_{y, t} + g$$
        $$y_{t+1} = y_t + v_{y, t}$$
    *   **Collision Detection**: Axis-Aligned Bounding Box (AABB) collisions between the ship's bounds and the rectangular obstacle columns.

### 3. Neon Breaker (Ball Reflection & Bricks) — Slot 6
*   **Overview**: A modern arcade breakout game featuring glowing destructible bricks and physics-based ball bouncing.
*   **Gameplay Loop**:
    *   A glowing ball bounces around the screen, breaking bricks.
    *   The player controls a horizontal paddle at the bottom of the screen to keep the ball in play.
    *   Each brick destroyed releases light particles and scores points.
    *   If the ball falls past the paddle, a life is lost.
*   **Touch Controls**: Dragging horizontally anywhere on the screen to move the paddle.
*   **Uncomplicated Physics**:
    *   **Elastic Collisions & Reflections**: Standard boundary reflection:
        $$v_x = -v_x \quad (\text{on side wall hit})$$
        $$v_y = -v_y \quad (\text{on top wall/brick hit})$$
    *   **Steering Reflection**: When hitting the paddle, the angle of reflection is adjusted based on where the ball lands relative to the center of the paddle (giving the player control over target aiming).

### 4. Neon Stack (Tower Stacker) — Slot 7
*   **Overview**: A stack-building reflex game where players stack sliding neon rectangular slabs as high as possible.
*   **Gameplay Loop**:
    *   A neon slab slides back and forth at the top of the screen.
    *   Tapping the screen drops the slab onto the stack below.
    *   Any part of the slab that overhangs the underlying stack is sliced off and falls down under gravity.
    *   The next slab's width is reduced to match the size of the successfully stacked portion.
    *   If the player misses the stack completely, it's Game Over.
*   **Touch Controls**: Tap anywhere to drop the slab.
*   **Uncomplicated Physics**:
    *   **1D Overlap Math**: Computes the intersecting range $[x_1, x_2]$ of the dropping slab and the top of the stack.
    *   **Gravity Particulate**: Sliced-off sections are spawned as independent bodies with a constant falling speed ($y$-velocity).

### 5. Orbit Dodge (Gravitational Orbiting) — Slot 8
*   **Overview**: A circular evasion game where a player controls a small ship in orbit, adjusting its altitude to avoid rotating space debris.
*   **Gameplay Loop**:
    *   The player's ship orbits a central glowing star.
    *   Pressing and holding the screen expands the ship's orbital radius.
    *   Releasing the screen allows the star's gravity to pull the ship back inward.
    *   The player must steer between different orbital bands to avoid incoming debris.
*   **Touch Controls**: Touch-and-hold to move outward; release to pull inward.
*   **Uncomplicated Physics**:
    *   **Radial Gravity**: Simulated using centripetal movement. The ship's position is computed using polar coordinates converted to Cartesian space:
        $$x = x_{\text{center}} + r \cdot \cos(\theta)$$
        $$y = y_{\text{center}} + r \cdot \sin(\theta)$$
        where radius $r$ accelerates outward under touch thrust and decelerates inward under gravitational pull.

### 6. Neon Catcher (Basket Catching) — Slot 9
*   **Overview**: A catching game where the player intercepts falling celestial bodies while dodging descending hazards.
*   **Gameplay Loop**:
    *   Glowing stars and hazardous bombs fall from pipes at the top of the screen.
    *   The player steers a collection basket at the bottom.
    *   Catching stars increases score; catching bombs or letting stars drop past the bottom causes a life deduction.
*   **Touch Controls**: Drag left and right to move the basket.
*   **Uncomplicated Physics**:
    *   **Uniform Fall Speed**: Vertical linear translation of falling items ($y_{\text{new}} = y_{\text{old}} + v_{\text{fall}}$).
    *   **AABB Collision**: Simple overlap test between the basket's bounding box and the falling items' coordinates.

### 7. Neon Invaders (Retro Space Shooter) — Slot 10
*   **Overview**: A touchscreen shoot-'em-up where a player defends a grid-based area from descending rows of neon pixel invaders.
*   **Gameplay Loop**:
    *   Rows of neon enemy ships descend from the top, moving side-to-side.
    *   The player controls a defense ship at the bottom, which automatically fires lasers.
    *   The player must steer to hit invaders while dodging returning plasma bullets.
*   **Touch Controls**: Drag left and right to steer the defense ship.
*   **Uncomplicated Physics**:
    *   **Linear Projectiles**: Constant vertical speed for lasers ($v_{\text{laser}}$ upward) and plasma bullets ($v_{\text{bullet}}$ downward).
    *   **Hitbox Grid**: Checks simple coordinate overlapping between lasers and invader grids.

---

## Integration Plan & Roadmap

### Step 1: Framework Setup
*   Construct shared JavaScript helper files or classes for standard particle bursts, common touch-gesture handlers, and high-score saves using `localStorage`.

### Step 2: Phase 1 Implementations (Slots 4 - 6)
*   Build **Neon Slasher** (`neon_slasher.html`), **Flappy Neon** (`flappy_neon.html`), and **Neon Breaker** (`neon_breaker.html`).

### Step 3: Phase 2 Implementations (Slots 7 - 10)
*   Build **Neon Stack** (`neon_stack.html`), **Orbit Dodge** (`orbit_dodge.html`), **Neon Catcher** (`neon_catcher.html`), and **Neon Invaders** (`neon_invaders.html`).

### Step 4: Portal Update
*   Modify [index.html](file:///home/marco/code/flying_ball_game/index.html) to link all seven games, replacing all "Coming Soon" placeholders with custom names, icons, and styling.
