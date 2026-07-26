# The Arcade Hub: HTML5 Mini-Games Collection

Welcome to **The Arcade Hub**, a collection of lightweight, responsive HTML5 arcade games designed for both desktop and mobile/touchscreen platforms. The collection features clean designs, fluid canvas-based gameplay, and simple, intuitive physics models.

## Repository Contents

### 1. Main Portal
* **[index.html](file:///home/marco/code/flying_ball_game/index.html)**: The landing page and game selection dashboard linking all games.

### 2. Active Arcade Games
* **[flying_ball_game.html](file:///home/marco/code/flying_ball_game/flying_ball_game.html) (Ball Pop Challenge)**: Pop rising colorful balloons before they exit the screen.
* **[neon_racer.html](file:///home/marco/code/flying_ball_game/neon_racer.html) (Neon Racer)**: A top-down ball-on-track racing game. Avoid exceeding dynamically computed curve speed limits while racing against AI competitors.
* **[neon.html](file:///home/marco/code/flying_ball_game/neon.html) (Neon Void)**: Precision dodging of falling neon obstacles.
* **[neon_slasher.html](file:///home/marco/code/flying_ball_game/neon_slasher.html) (Neon Slasher)**: Swipe-to-slice rising neon discs while dodging volatile bomb cores.
* **[flappy_neon.html](file:///home/marco/code/flying_ball_game/flappy_neon.html) (Flappy Neon)**: Tap to boost gravity-bound spaceship through energy columns.
* **[neon_breaker.html](file:///home/marco/code/flying_ball_game/neon_breaker.html) (Neon Breaker)**: Retro brick-breaker with slide-paddle and angle-adjusted bounces.
* **[neon_stack.html](file:///home/marco/code/flying_ball_game/neon_stack.html) (Neon Stack)**: Align sliding slabs to build the highest tower possible.
* **[orbit_dodge.html](file:///home/marco/code/flying_ball_game/orbit_dodge.html) (Orbit Dodge)**: Adjust radial spaceship orbit height to dodge rotating space rocks.
* **[neon_catcher.html](file:///home/marco/code/flying_ball_game/neon_catcher.html) (Neon Catcher)**: Drag basket to catch falling stars and dodge descending traps.
* **[neon_invaders.html](file:///home/marco/code/flying_ball_game/neon_invaders.html) (Neon Invaders)**: Retro alien shooter with automatic laser fire and side-to-side steering.

---

## Detailed Game Breakdown & Physics

### Ball Pop Challenge (`flying_ball_game.html`)
* **Objective**: Advance through 5 progressive levels to reach 150 points and win.
* **Controls**: Touchscreen tap or mouse click (tap special glowing regions for screen-wide shockwaves).
* **Gameplay Dynamics**:
  * **Irreversible Progression**: Once a level is unlocked, you remain in that level even if your score drops (levels only go up).
  * **Score Penalties & Floors**: Letting balls drift off-screen or hit obstacles deducts 1 point. To protect progress, a score "floor" of 10 points below the current level's threshold is enforced ($\text{floor} = \max(0, \text{threshold} - 10)$). You can never drop below this floor.
  * **Level Up Modal**: Unlocking a new level opens a `"Level Up! Starting Level {N}"` popup, pausing the game until the player clicks `"Let's Go!"`.
  * **Level 1 (0-9 pts)**: Standard balls (radius 20-30, speed 1.5-2.5, floor: 0).
  * **Level 2 (10-29 pts)**: Speed increase (2.5-3.8, floor: 0).
  * **Level 3 (30-49 pts)**: High-contrast mix of very small and very large balls (radius 12-45, floor: 20).
  * **Level 4 (50-99 pts)**: Spawns red horizontal energy obstacles. Hitting obstacles deducts a point (floor: 40).
  * **Level 5 (100-149 pts)**: Combines all previous speed, size, and obstacle hazards, plus adds 3 random glowing "Shockwave" regions to wipe the screen (floor: 90).
  * **Victory (150+ pts)**: Displays a Congratulations modal.
* **Physics & Math**:
  * **Linear Motion**: Simple vertical translation ($y_{\text{new}} = y_{\text{old}} - \text{speed}$).
  * **Collision/Hit Detection**: Uses Euclidean distance to verify clicks:
    $$\text{distance} = \sqrt{(tapX - x)^2 + (tapY - y)^2} < \text{radius}$$
  * **Obstacle-Circle Intersection**: Calculates the closest point $x_{\text{closest}}$ on the horizontal line segment $[x_1, x_2]$ at height $y_{\text{line}}$ to the ball center $(cx, cy)$:
    $$x_{\text{closest}} = \max(x_1, \min(x_2, cx))$$
    $$\text{distanceSq} = (cx - x_{\text{closest}})^2 + (cy - y_{\text{line}})^2 \le r^2$$

### Neon Racer (`neon_racer.html`)
* **Objective**: Complete 2 laps in 1st place. You lose if you crash on a corner or finish behind any AI competitor.
* **Controls**: Mouse click or touchscreen hold to accelerate, release to slow down.
* **Math/Physics**:
  * **Spline Interpolation**: Generates smooth track nodes by applying Catmull-Rom spline calculations to control points.
  * **Dynamic Curvature Detection**: Curvature at point $i$ is calculated as the absolute difference between segment angles:
    $$\theta_{\text{diff}} = |\text{atan2}(y_{i+1} - y_i, x_{i+1} - x_i) - \text{atan2}(y_i - y_{i-1}, x_i - x_{i-1})|$$
    The safe speed limit is dynamically computed from curvature:
    $$v_{\text{safe}} = \max(2.8, 7.2 - C \cdot \theta_{\text{diff}})$$
  * **Drift Slippage & Crash**: Going faster than $v_{\text{safe}}$ accumulates drift slip points. Staying over-limit for 15 frames or exceeding it by $+1.6$ results in a spin-out crash (instant defeat).
  * **AI Braking Proximity**: AI vehicles look ahead 25 steps to brake in advance and safely navigate corners without crashing.

### Neon Void (`neon.html`)
* **Objective**: Survive as long as possible by dodging falling obstacles.
* **Controls**: Click-and-drag with a mouse or tap-and-drag on a touchscreen.
* **Math/Physics**: Snappy linear interpolation chaser physics ($x_{t+1} = x_t + (x_{\text{target}} - x_t) \cdot 0.8$) and circular radius collision testing.

### Neon Slasher (`neon_slasher.html`)
* **Objective**: Swipe and cut flying discs; dodge spiked red bomb cores.
* **Math/Physics**: Projectile parabolic arcs and segment-to-circle intersection detection.

### Flappy Neon (`flappy_neon.html`)
* **Objective**: Fly between columns of energy barriers.
* **Math/Physics**: Downward gravity combined with discrete upward velocity resets (thrust pulses) on screen tap, and AABB collision.

### Neon Breaker (`neon_breaker.html`)
* **Objective**: Destroy all upper brick rows using a bouncing ball.
* **Math/Physics**: Standard rebound angle calculation ($v_x = -v_x$ or $v_y = -v_y$) combined with paddle-offset steer angle adjustments.

### Neon Stack (`neon_stack.html`)
* **Objective**: Stack moving blocks perfectly to construct a tall neon skyscraper.
* **Math/Physics**: 1D overlap intersection and standard gravity pull on sliced debris.

### Orbit Dodge (`orbit_dodge.html`)
* **Objective**: Stay in orbit around a star while avoiding floating rocks.
* **Math/Physics**: Polar coordinate translation ($x = r\cos\theta, y = r\sin\theta$) paired with touch-hold radial acceleration.

### Neon Catcher (`neon_catcher.html`)
* **Objective**: Collect falling items with a movable basket.
* **Math/Physics**: Top-down linear downward speed vectors and box boundaries overlap checking.

### Neon Invaders (`neon_invaders.html`)
* **Objective**: Destroy descending waves of invaders.
* **Math/Physics**: Automatic vertical linear laser movement and grid-bound enemy column shifts.
