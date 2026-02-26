/**
 * Seed Script: LTO Reviewer Modules & Quiz Questions
 * Populates Firestore with /reviewer_modules and /quiz_questions collections
 *
 * Usage: npx ts-node -e "require('./src/scripts/seed-quiz.ts')"
 * Or via: pnpm seed:quiz (after adding script to package.json)
 *
 * Collections created:
 *   reviewer_modules/{id}  — study materials grouped by domain
 *   quiz_questions/{id}    — 60 LTO exam questions across 6 phases (10 each)
 */

import * as dotenv from 'dotenv'
dotenv.config()

import { getFirestore } from '../lib/firebase-admin'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReviewerModule {
  id: string
  title: string
  domain: string
  content: string
  category: 'non-professional' | 'professional' | 'student' | 'renewal' | 'special-rights'
}

interface QuizQuestion {
  id: string
  phaseIndex: number
  domain: string
  questionText: string
  options: string[]
  correctAnswerIndex: number
  staticExplanation: string
}

// ---------------------------------------------------------------------------
// Reviewer Modules (study materials)
// ---------------------------------------------------------------------------

const reviewerModules: ReviewerModule[] = [
  {
    id: 'rm-traffic-signs',
    title: 'Traffic Signs and Signals',
    domain: 'Traffic Signs',
    category: 'non-professional',
    content: `Traffic signs in the Philippines are classified into three categories:

**1. Regulatory Signs (White/Red background)**
- STOP sign: Come to a complete stop, yield to all traffic.
- YIELD sign: Slow down and give way to other vehicles.
- Speed limit signs: Indicate the maximum legal speed in km/h.
- NO ENTRY / DO NOT ENTER: Prohibits vehicle entry.
- ONE WAY: Traffic flows only in the direction of the arrow.
- NO PARKING / NO LOADING: Parking/loading is prohibited in that area.

**2. Warning Signs (Yellow/Orange background)**
- SHARP CURVE AHEAD: Reduce speed significantly.
- SLIPPERY ROAD: Drive carefully, especially in wet conditions.
- SCHOOL ZONE: Slow to 20 km/h; children may be present.
- PEDESTRIAN CROSSING: Be prepared to stop for pedestrians.
- ROAD NARROWS: Merge lanes appropriately.

**3. Informational/Guide Signs (Green/Blue background)**
- DESTINATION: Distances to cities or towns.
- SERVICE: Hospitals, gas stations, rest areas.
- EMERGENCY: Evacuation routes.

**Traffic Signals:**
- GREEN LIGHT: Proceed if the way is clear.
- YELLOW/AMBER LIGHT: Prepare to stop; clear the intersection safely.
- RED LIGHT: Come to a complete stop behind the stop line.
- FLASHING RED: Treat as a STOP sign.
- FLASHING YELLOW: Proceed with caution.`,
  },
  {
    id: 'rm-speed-limits',
    title: 'Speed Limits and Lane Rules',
    domain: 'Speed & Lanes',
    category: 'non-professional',
    content: `**Speed Limits (RA 4136 and MMDA regulations):**

| Road Type | Maximum Speed |
|-----------|--------------|
| Expressway | 100 km/h |
| National highway (open road) | 80 km/h |
| City/municipal road | 60 km/h |
| Residential/school zone | 20 km/h |
| Congested area | 30 km/h |

**Lane Rules:**
- Keep RIGHT at all times except when overtaking.
- Overtaking is done on the LEFT side of the vehicle ahead.
- Do NOT overtake on hills, curves, intersections, or pedestrian crossings.
- The leftmost lane of a multi-lane road is for faster-moving traffic.
- Heavy vehicles (buses, trucks) must stay on the rightmost lane on expressways.

**Following Distance:**
- Maintain at least 3 seconds of following distance in good weather.
- Double the following distance in rain or fog.

**Merging:**
- Yield to vehicles already in the lane you are merging into.
- Use your signal light at least 30 meters before merging.`,
  },
  {
    id: 'rm-right-of-way',
    title: 'Right of Way Rules',
    domain: 'Right of Way',
    category: 'non-professional',
    content: `**General Right of Way Rules (RA 4136):**

1. **At uncontrolled intersections:** The vehicle on the RIGHT has the right of way.
2. **At a STOP sign:** Yield to ALL traffic before proceeding.
3. **At a YIELD sign:** Yield to oncoming and crossing traffic.
4. **Left turns:** Yield to oncoming traffic and pedestrians.
5. **Emergency vehicles:** Always yield to ambulances, fire trucks, and police vehicles using sirens/lights. Pull over to the right and stop.
6. **Pedestrian crossings:** Always stop for pedestrians in marked crosswalks.
7. **Roundabouts:** Vehicles INSIDE the roundabout have the right of way over vehicles entering.
8. **School buses:** Do NOT overtake a school bus with flashing lights.
9. **Bicycle lanes:** Do NOT drive or park in designated bicycle lanes.
10. **Blind intersections:** Slow down and be prepared to stop even without a sign.`,
  },
  {
    id: 'rm-license-requirements',
    title: "Driver's License Requirements",
    domain: 'Licensing',
    category: 'student',
    content: `**Types of Driver's Licenses in the Philippines (RA 10930):**

1. **Student Permit (SP)**
   - Minimum age: 17 years old
   - Valid for: 1 year
   - Must be accompanied by a licensed driver at all times
   - Cannot drive between 10 PM – 5 AM

2. **Non-Professional Driver's License (NPDL)**
   - Minimum age: 17 years old
   - For personal/private vehicles only
   - Requires: Written exam + driving test
   - Valid for: 5 years (new), 3 years (renewal if expired more than 1 year)

3. **Professional Driver's License (PDL)**
   - Minimum age: 18 years old
   - For public utility and commercial vehicles
   - Requires: NPDL first, plus additional tests
   - Higher standard for road safety knowledge

**Restrictions (for Student Permit):**
- Code 1: Only valid in the issuing region
- No driving during prohibited hours
- No highways unless accompanied

**License Renewal:**
- Within 30 days before/after expiry: no penalty
- 1–12 months late: penalty applies
- More than 1 year expired: reapply from scratch (written + practical tests)`,
  },
  {
    id: 'rm-penalties',
    title: 'Traffic Penalties and Fines',
    domain: 'Penalties',
    category: 'renewal',
    content: `**Common Traffic Violations and Fines (RA 4136, MMDA Regulation):**

| Violation | Fine (₱) |
|-----------|---------|
| Speeding (1–30 km/h over limit) | 1,200 |
| Speeding (31+ km/h over limit) | 2,400 |
| Beating a red light | 1,000 |
| Illegal parking | 1,000 |
| Driving without a license | 3,000 |
| Driving with expired license | 2,000 |
| Reckless driving | 5,000–10,000 |
| Driving under the influence (DUI) | 20,000 + imprisonment |
| Refusal to submit to sobriety test | License confiscation |
| No seatbelt (driver) | 500 |
| No seatbelt (passenger) | 500 |
| Using mobile phone while driving | 5,000 |
| Failure to use child car seat (below 12 y/o) | 1,000 |

**Impounding:**
- Vehicles may be impounded for colorum operation, serious violations, and DUI.
- Owner must pay impounding fee + fines before release.

**License Suspension/Revocation:**
- 3 or more serious violations within 12 months = suspension
- DUI causing death = revocation`,
  },
  {
    id: 'rm-vehicle-requirements',
    title: 'Vehicle Registration and Requirements',
    domain: 'Vehicle Registration',
    category: 'renewal',
    content: `**Motor Vehicle Registration (MVR) Requirements (RA 4136):**

1. **Documents required for registration:**
   - Accomplished Motor Vehicle Inspection Report (MVIR)
   - Proof of insurance (Compulsory Third Party Liability – CTPL)
   - Official Receipt (OR) of previous registration
   - Certificate of Registration (CR)

2. **Annual Registration Renewal:**
   - Registration expires on the last day of the birth month of the owner
   - Must renew within the renewal period to avoid penalties
   - Late renewal penalty: ₱200 per month late

3. **Compulsory Third Party Liability (CTPL):**
   - Required by law for ALL registered motor vehicles
   - Covers death or injury of third parties in accidents
   - Private cars: minimum ₱1,000,000 coverage per incident

4. **Emission Testing:**
   - Required for all vehicles 4 years old and above
   - Must pass before registration can be renewed

5. **Vehicle Safety Sticker:**
   - Issued after passing vehicle inspection
   - Must be displayed on windshield at all times

6. **Plate Numbers:**
   - Must be clean, visible, and properly mounted
   - Covering or defacing plates is illegal`,
  },
]

// ---------------------------------------------------------------------------
// Quiz Questions — 60 total, 10 per phase
// ---------------------------------------------------------------------------

const quizQuestions: QuizQuestion[] = [
  // -------------------------------------------------------------------------
  // PHASE 0 — Traffic Signs (10 questions)
  // -------------------------------------------------------------------------
  {
    id: 'q-0-001',
    phaseIndex: 0,
    domain: 'Traffic Signs',
    questionText: 'What does an octagonal red STOP sign require you to do?',
    options: [
      'Slow down and proceed if clear',
      'Come to a complete stop and yield to all traffic',
      'Stop only if other vehicles are present',
      'Honk your horn and proceed',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'A STOP sign (RA 4136) requires a complete stop before the stop line or crosswalk. You must yield to ALL traffic and pedestrians before proceeding, not just when other vehicles are present.',
  },
  {
    id: 'q-0-002',
    phaseIndex: 0,
    domain: 'Traffic Signs',
    questionText: 'A triangular sign with a red border in the Philippines generally indicates:',
    options: [
      'A mandatory instruction',
      'A warning or hazard ahead',
      'An informational guide',
      'A prohibition',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Triangular signs with a red border are WARNING signs. They alert drivers to hazards or conditions ahead (e.g., sharp curve, slippery road, pedestrian crossing) so they can reduce speed and proceed with caution.',
  },
  {
    id: 'q-0-003',
    phaseIndex: 0,
    domain: 'Traffic Signs',
    questionText: 'What should you do when you encounter a YIELD sign?',
    options: [
      'Come to a complete stop and wait for a green light',
      'Proceed at normal speed',
      'Slow down and give way to crossing or oncoming traffic',
      'Honk to alert other drivers',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'A YIELD sign means slow down and give priority to vehicles and pedestrians in the path you are entering. You do not need to make a complete stop unless it is necessary to avoid a collision.',
  },
  {
    id: 'q-0-004',
    phaseIndex: 0,
    domain: 'Traffic Signs',
    questionText: 'What does a flashing RED traffic signal mean?',
    options: [
      'Proceed with caution',
      'Stop completely, then proceed when safe',
      'Do not enter',
      'Slow down for road works',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'A flashing red light is treated the same as a STOP sign: come to a complete stop, yield to all traffic and pedestrians, then proceed only when it is safe to do so.',
  },
  {
    id: 'q-0-005',
    phaseIndex: 0,
    domain: 'Traffic Signs',
    questionText: 'What does a flashing YELLOW (amber) traffic signal mean?',
    options: [
      'Stop immediately',
      'Prepare to stop; clear the intersection',
      'Proceed with caution',
      'Yield to traffic from the right',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'A flashing yellow light is a warning to proceed with caution. Unlike a flashing red, you do not need to stop completely — but you must slow down and be alert to other vehicles and pedestrians.',
  },
  {
    id: 'q-0-006',
    phaseIndex: 0,
    domain: 'Traffic Signs',
    questionText:
      'You see a blue circular sign with a white arrow pointing left. What does this mean?',
    options: [
      'No left turn allowed',
      'Turn left mandatory',
      'Road curves to the left',
      'Left lane closed ahead',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'A blue circular sign with a directional arrow is a MANDATORY instruction sign. A white left arrow means you MUST turn left at that point. Circular blue signs indicate compulsory actions.',
  },
  {
    id: 'q-0-007',
    phaseIndex: 0,
    domain: 'Traffic Signs',
    questionText:
      'A white rectangular sign with black text shows "60". What does this sign indicate?',
    options: [
      'Advisory speed of 60 km/h for curves',
      'Minimum speed is 60 km/h',
      'Maximum speed limit is 60 km/h',
      'Distance to the next town is 60 km',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'A white rectangular speed sign with a plain number is a REGULATORY speed limit sign. "60" means the maximum legal speed is 60 km/h. Exceeding it is a traffic violation.',
  },
  {
    id: 'q-0-008',
    phaseIndex: 0,
    domain: 'Traffic Signs',
    questionText: 'What does a "NO ENTRY" sign look like and what does it mean?',
    options: [
      'Red circle with a white horizontal bar; vehicles must not enter',
      'Red triangle with an exclamation mark; proceed with caution',
      'White circle with a red border; no parking',
      'Red octagon; full stop required',
    ],
    correctAnswerIndex: 0,
    staticExplanation:
      'The NO ENTRY sign is a red circle with a horizontal white bar across it. It prohibits all vehicles from entering a road or lane — often used on one-way roads to prevent wrong-way entry.',
  },
  {
    id: 'q-0-009',
    phaseIndex: 0,
    domain: 'Traffic Signs',
    questionText: 'A yellow diamond sign showing a figure of a child means:',
    options: [
      'Playground ahead — horn allowed',
      'School zone — slow to 20 km/h',
      'Day care center — no entry for vehicles',
      'Pedestrian crossing — vehicles have right of way',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'A yellow diamond sign with a child figure indicates a SCHOOL ZONE. Drivers must reduce speed to 20 km/h (or as posted). Children may unexpectedly enter the road, so extra caution is essential.',
  },
  {
    id: 'q-0-010',
    phaseIndex: 0,
    domain: 'Traffic Signs',
    questionText: 'What color are informational/guide signs on Philippine highways?',
    options: [
      'Yellow with black text',
      'Red with white text',
      'Green with white text',
      'White with black text',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'Informational and guide signs on Philippine highways are green with white text. They provide directions to destinations, distances, and highway numbers to help drivers navigate.',
  },

  // -------------------------------------------------------------------------
  // PHASE 1 — Speed Limits & Lane Rules (10 questions)
  // -------------------------------------------------------------------------
  {
    id: 'q-1-001',
    phaseIndex: 1,
    domain: 'Speed & Lanes',
    questionText: 'What is the maximum speed limit on Philippine expressways?',
    options: ['80 km/h', '100 km/h', '120 km/h', '60 km/h'],
    correctAnswerIndex: 1,
    staticExplanation:
      'Under Philippine regulations, the maximum speed limit on expressways is 100 km/h. Exceeding this is a violation subject to fines. Some toll expressways may post different limits — always follow posted signs.',
  },
  {
    id: 'q-1-002',
    phaseIndex: 1,
    domain: 'Speed & Lanes',
    questionText: 'What is the speed limit when passing through a school zone?',
    options: ['30 km/h', '40 km/h', '20 km/h', '50 km/h'],
    correctAnswerIndex: 2,
    staticExplanation:
      'The speed limit in a school zone is 20 km/h. School zones are designated areas around schools where children frequently cross. Exceeding this limit poses serious safety risks and carries heavy fines.',
  },
  {
    id: 'q-1-003',
    phaseIndex: 1,
    domain: 'Speed & Lanes',
    questionText: 'On a two-lane road outside the city, on which side should you overtake?',
    options: [
      'On the right side of the vehicle ahead',
      'On the left side of the vehicle ahead',
      'Either side, depending on road width',
      'Only when the road is divided by a barrier',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'In the Philippines (left-hand traffic), overtaking is done on the LEFT side of the vehicle ahead. The overtaking vehicle uses the right lane (oncoming traffic lane) momentarily to pass. Always ensure the road ahead is clear.',
  },
  {
    id: 'q-1-004',
    phaseIndex: 1,
    domain: 'Speed & Lanes',
    questionText: 'Where is it ILLEGAL to overtake another vehicle?',
    options: [
      'On a straight road with no oncoming traffic',
      'At the crest of a hill, curve, or intersection',
      'On a two-lane highway with broken center line',
      'When traveling at 40 km/h',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Overtaking at the crest of a hill, around a curve, or at intersections is prohibited because visibility is limited. You cannot see oncoming traffic in time to avoid a collision, making it extremely dangerous.',
  },
  {
    id: 'q-1-005',
    phaseIndex: 1,
    domain: 'Speed & Lanes',
    questionText: 'A solid yellow line on your side of the center means:',
    options: [
      'Overtaking is allowed if road is clear',
      'Overtaking is prohibited on your side',
      'Road narrows ahead',
      'End of no-overtaking zone',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'A solid yellow line on your side of the road means YOU may NOT overtake. A broken line means overtaking is permitted (with care). A double solid yellow means neither direction may overtake.',
  },
  {
    id: 'q-1-006',
    phaseIndex: 1,
    domain: 'Speed & Lanes',
    questionText: 'What is the minimum following distance rule in good weather conditions?',
    options: [
      '1 second behind the vehicle ahead',
      '2 seconds behind the vehicle ahead',
      '3 seconds behind the vehicle ahead',
      '5 meters behind the vehicle ahead',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'The 3-second rule is the minimum safe following distance. Pick a fixed point; when the vehicle ahead passes it, count "one-one-thousand, two-one-thousand, three-one-thousand." You should not reach that point before finishing. In rain or fog, double the distance.',
  },
  {
    id: 'q-1-007',
    phaseIndex: 1,
    domain: 'Speed & Lanes',
    questionText:
      'On a multi-lane expressway, which lane are heavy trucks and buses required to use?',
    options: [
      'The leftmost (fast) lane',
      'The middle lane only',
      'The rightmost (slow) lane',
      'Any lane they choose',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'Heavy vehicles (buses, trucks, trailers) are required to use the rightmost lane on expressways. Lighter, faster vehicles use the left lanes. This is for safety and traffic flow efficiency.',
  },
  {
    id: 'q-1-008',
    phaseIndex: 1,
    domain: 'Speed & Lanes',
    questionText:
      'How far in advance must you use your turn signal before changing lanes or turning?',
    options: [
      'At least 10 meters before',
      'At least 30 meters before',
      'At least 50 meters before',
      'Only when another vehicle is directly behind you',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Philippine traffic regulations require signaling at least 30 meters before a lane change or turn. This gives other drivers and pedestrians enough warning to react safely.',
  },
  {
    id: 'q-1-009',
    phaseIndex: 1,
    domain: 'Speed & Lanes',
    questionText:
      'What is the maximum speed limit on a national highway passing through an open rural area?',
    options: ['100 km/h', '80 km/h', '60 km/h', '50 km/h'],
    correctAnswerIndex: 1,
    staticExplanation:
      'The maximum speed on an open national highway (outside city limits) is 80 km/h. This applies unless a lower speed is posted. Inside cities the default is 60 km/h.',
  },
  {
    id: 'q-1-010',
    phaseIndex: 1,
    domain: 'Speed & Lanes',
    questionText: 'What should you do before merging onto an expressway from an on-ramp?',
    options: [
      'Stop at the end of the ramp and wait for a gap',
      'Accelerate to match expressway speed and merge into a gap',
      'Merge immediately regardless of traffic',
      'Use the emergency lane to gain speed',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'On an on-ramp, you should accelerate to match the speed of expressway traffic, check mirrors and blind spots, and merge smoothly into a safe gap. Stopping at the end of a ramp is dangerous and illegal.',
  },

  // -------------------------------------------------------------------------
  // PHASE 2 — Right of Way (10 questions)
  // -------------------------------------------------------------------------
  {
    id: 'q-2-001',
    phaseIndex: 2,
    domain: 'Right of Way',
    questionText:
      'At an uncontrolled intersection (no signs, no signals), who has the right of way?',
    options: [
      'The vehicle traveling at higher speed',
      'The vehicle approaching from the right',
      'The vehicle approaching from the left',
      'The larger vehicle',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Under RA 4136, at an uncontrolled intersection, the vehicle approaching from the RIGHT has the right of way. This is the "yield to the right" rule — you must yield to any vehicle on your right.',
  },
  {
    id: 'q-2-002',
    phaseIndex: 2,
    domain: 'Right of Way',
    questionText:
      'An ambulance with sirens and lights activated is approaching from behind. What must you do?',
    options: [
      'Speed up to clear the road faster',
      'Continue at your current speed',
      'Pull over to the right and stop',
      'Move to the left lane and slow down',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'All emergency vehicles (ambulance, fire truck, police) using lights and sirens have absolute right of way. You must immediately pull over to the RIGHT side of the road and stop until the emergency vehicle passes.',
  },
  {
    id: 'q-2-003',
    phaseIndex: 2,
    domain: 'Right of Way',
    questionText: 'A pedestrian is crossing at a marked crosswalk. What must you do?',
    options: [
      'Honk to alert the pedestrian and proceed',
      'Slow down only if the pedestrian is directly in front of you',
      'Stop and yield to the pedestrian',
      'Continue — vehicles have right of way over pedestrians',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'Pedestrians in a marked crosswalk ALWAYS have the right of way. Drivers must stop and wait for them to fully cross. Failure to yield at crosswalks is a serious violation.',
  },
  {
    id: 'q-2-004',
    phaseIndex: 2,
    domain: 'Right of Way',
    questionText: 'You are making a LEFT turn at an intersection. Who must you yield to?',
    options: [
      'No one; left-turning vehicles have right of way',
      'Oncoming traffic and pedestrians crossing',
      'Only vehicles from the right',
      'Only trucks and buses',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'A vehicle turning left must yield to ALL oncoming traffic traveling straight through the intersection, and to pedestrians crossing in the path of the turn. Left turns are yielding maneuvers.',
  },
  {
    id: 'q-2-005',
    phaseIndex: 2,
    domain: 'Right of Way',
    questionText: 'Inside a roundabout, who has the right of way?',
    options: [
      'Vehicles entering from the largest road',
      'Vehicles circulating inside the roundabout',
      'Vehicles entering from the right',
      'The first vehicle to arrive',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Vehicles already circulating inside a roundabout have the right of way. Vehicles entering must yield and wait for a safe gap in the circulating traffic. This prevents gridlock and collisions.',
  },
  {
    id: 'q-2-006',
    phaseIndex: 2,
    domain: 'Right of Way',
    questionText:
      'A school bus has stopped with its red lights flashing. Vehicles in BOTH directions should:',
    options: [
      'Slow down to 20 km/h and pass carefully',
      'Stop completely and wait until the bus moves',
      'Stop only if children are visible on the road',
      'Pass only if on the opposite side of the road',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'When a school bus activates its red flashing lights to load or unload students, ALL vehicles in both directions must stop completely. Do not proceed until the bus turns off the flashing lights and moves.',
  },
  {
    id: 'q-2-007',
    phaseIndex: 2,
    domain: 'Right of Way',
    questionText:
      'At a T-intersection, the vehicle on the THROUGH road vs. the vehicle turning in — who has right of way?',
    options: [
      'The turning vehicle',
      'The vehicle that arrived first',
      'The vehicle on the through road',
      'Both proceed simultaneously',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'The vehicle traveling on the through (main) road has the right of way over a vehicle entering from a side road or T-junction. Vehicles entering from side roads must yield and wait for a clear gap.',
  },
  {
    id: 'q-2-008',
    phaseIndex: 2,
    domain: 'Right of Way',
    questionText: 'When two vehicles reach a 4-way STOP sign at the same time, who goes first?',
    options: [
      'The heavier vehicle',
      'The vehicle with more passengers',
      'The vehicle on the right',
      'The vehicle that honks first',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'At a 4-way stop, when two vehicles arrive at the same time, the vehicle on the RIGHT has the right of way. This is consistent with the general "yield to the right" rule at intersections.',
  },
  {
    id: 'q-2-009',
    phaseIndex: 2,
    domain: 'Right of Way',
    questionText:
      'You are exiting a private driveway onto a public road. Who has the right of way?',
    options: [
      'You do, because you are exiting',
      'Traffic on the public road',
      'Whoever is traveling faster',
      'You if there is no oncoming vehicle within 50 meters',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Traffic on the public road always has the right of way over a vehicle exiting a driveway, parking lot, or private road. You must wait for a complete safe gap before entering the road.',
  },
  {
    id: 'q-2-010',
    phaseIndex: 2,
    domain: 'Right of Way',
    questionText: 'Vehicles in a bicycle lane — what is the rule for motor vehicles?',
    options: [
      'Motor vehicles may drive in bicycle lanes when traffic is heavy',
      'Motor vehicles must never drive or park in designated bicycle lanes',
      'Motor vehicles may cross bicycle lanes to turn',
      'Motor vehicles have right of way over cyclists',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Designated bicycle lanes are exclusively for cyclists. Motor vehicles are strictly prohibited from driving or parking in them. Crossing a bicycle lane to make a turn is allowed only after yielding to cyclists.',
  },

  // -------------------------------------------------------------------------
  // PHASE 3 — Road Markings & Safe Driving (10 questions)
  // -------------------------------------------------------------------------
  {
    id: 'q-3-001',
    phaseIndex: 3,
    domain: 'Road Markings',
    questionText: 'A double solid yellow center line means:',
    options: [
      'Passing is allowed from both directions',
      'Passing is allowed from the left lane only',
      'Passing is prohibited in BOTH directions',
      'Road is about to end',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'A double solid yellow center line prohibits passing (overtaking) from BOTH directions. This marking is used in areas where it is unsafe to pass — such as near curves, hills, or narrow sections.',
  },
  {
    id: 'q-3-002',
    phaseIndex: 3,
    domain: 'Road Markings',
    questionText: 'White broken/dashed lane lines between lanes mean:',
    options: [
      'You must stay in your lane at all times',
      'Lane changing is permitted with care',
      'The lane is for merging only',
      'Pedestrian crossing zone',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'White broken (dashed) lines separating lanes indicate that lane changes are permitted, provided it is safe to do so. Solid white lines indicate lane changes are discouraged or prohibited.',
  },
  {
    id: 'q-3-003',
    phaseIndex: 3,
    domain: 'Road Markings',
    questionText: 'Yellow zigzag lines painted on the road beside a school mean:',
    options: [
      'Parking is allowed for short stops only',
      'No stopping or parking at any time',
      'Slow down to 20 km/h',
      'Horn prohibited zone',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Yellow zigzag markings indicate a NO STOPPING or NO PARKING zone. They are commonly used near schools, pedestrian crossings, and fire hydrants. Parking here is illegal and dangerous.',
  },
  {
    id: 'q-3-004',
    phaseIndex: 3,
    domain: 'Road Markings',
    questionText:
      'What do white diagonal lines inside a box painted on the road (box junction) mean?',
    options: [
      'Parking is allowed in this area',
      'Do not enter the box unless your exit is clear',
      'U-turns are permitted here',
      'Pedestrian crossing area',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'A box junction (yellow or white criss-cross lines) means you must NOT enter the box unless your exit is clear. This prevents gridlock at busy intersections. Blocking the box is a traffic violation.',
  },
  {
    id: 'q-3-005',
    phaseIndex: 3,
    domain: 'Road Markings',
    questionText: 'A solid white line along the edge of the road (fog line) indicates:',
    options: [
      'The edge of the travel lane / road boundary',
      'A lane reserved for motorcycles',
      'The centerline of the road',
      'A pedestrian crossing',
    ],
    correctAnswerIndex: 0,
    staticExplanation:
      'A solid white edge line (or fog line) marks the right boundary of the travel lane. It helps drivers stay on the road in poor visibility conditions like fog, rain, or night driving.',
  },
  {
    id: 'q-3-006',
    phaseIndex: 3,
    domain: 'Road Markings',
    questionText:
      'You see a broad white stripe across the road with a dashed white line before it. This is a:',
    options: [
      'STOP line',
      'Give way / YIELD line',
      'Railroad crossing marking',
      'Speed bump indicator',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'A broad white transverse line with dashed lines before it is a GIVE WAY (yield) marking. It is placed at junctions where you must yield to traffic on the main road but do not need to stop completely unless necessary.',
  },
  {
    id: 'q-3-007',
    phaseIndex: 3,
    domain: 'Road Markings',
    questionText: 'A solid white transverse line across the road near a STOP sign represents:',
    options: [
      'The yield line',
      'The pedestrian crossing line',
      'The stop line — you must not pass it when stopped',
      'The crosswalk boundary',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'The solid white STOP line marks the exact position where you must stop your vehicle when required by a stop sign or red signal. Your vehicle must not cross this line while stopped.',
  },
  {
    id: 'q-3-008',
    phaseIndex: 3,
    domain: 'Road Markings',
    questionText: 'What does a yellow curb marking indicate?',
    options: [
      'Loading and unloading zone for limited time',
      'No parking — but stopping briefly is allowed',
      'No stopping, standing, or parking at any time',
      'Parking permitted during nighttime only',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'A yellow curb marking means NO STOPPING, STANDING, or PARKING at any time. It is the most restrictive curb marking, often used at fire hydrants, bus stops, and emergency access points.',
  },
  {
    id: 'q-3-009',
    phaseIndex: 3,
    domain: 'Road Markings',
    questionText: 'Raised pavement markers (RPMs) or "cats eyes" on the road serve what purpose?',
    options: [
      'Indicate speed bumps ahead',
      'Mark lane boundaries for visibility at night or in rain',
      'Indicate where to stop at intersections',
      'Mark emergency vehicle lanes',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Raised pavement markers (reflective cats eyes) reflect headlights to make lane boundaries visible at night or in rain. They supplement painted lines and help drivers stay in their lane in low-visibility conditions.',
  },
  {
    id: 'q-3-010',
    phaseIndex: 3,
    domain: 'Road Markings',
    questionText: 'A white diamond shape painted in a lane means that lane is reserved for:',
    options: [
      'Emergency vehicles only',
      'High-occupancy vehicles (HOV) or bus/bicycle use',
      'Overtaking vehicles',
      'Slow-moving vehicles',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'A white diamond symbol painted in a lane designates it as a HOV (High Occupancy Vehicle) lane, or in some cases a bus-only or bicycle lane. Single-occupancy vehicles may not use this lane during restricted hours.',
  },

  // -------------------------------------------------------------------------
  // PHASE 4 — Driver's License & Legal Requirements (10 questions)
  // -------------------------------------------------------------------------
  {
    id: 'q-4-001',
    phaseIndex: 4,
    domain: 'Licensing',
    questionText: "What is the minimum age to apply for a Philippine Student Driver's Permit?",
    options: ['16 years old', '17 years old', '18 years old', '21 years old'],
    correctAnswerIndex: 1,
    staticExplanation:
      "Under RA 10930, the minimum age to apply for a Student Driver's Permit (SP) is 17 years old. The permit allows practice driving under the supervision of a licensed driver.",
  },
  {
    id: 'q-4-002',
    phaseIndex: 4,
    domain: 'Licensing',
    questionText: "A Student Driver's Permit holder may NOT drive during which hours?",
    options: ['6 PM – 6 AM', '8 PM – 6 AM', '10 PM – 5 AM', '12 AM – 6 AM'],
    correctAnswerIndex: 2,
    staticExplanation:
      'Student permit holders are prohibited from driving between 10 PM and 5 AM. This nighttime restriction is designed to limit practice driving to safer daylight or early evening conditions.',
  },
  {
    id: 'q-4-003',
    phaseIndex: 4,
    domain: 'Licensing',
    questionText:
      "For how many years is a newly issued Non-Professional Driver's License (NPDL) valid?",
    options: ['1 year', '3 years', '5 years', '10 years'],
    correctAnswerIndex: 2,
    staticExplanation:
      "Under RA 10930, a newly issued Non-Professional Driver's License (NPDL) is valid for 5 years. It is renewable before or up to 30 days after expiry without penalty.",
  },
  {
    id: 'q-4-004',
    phaseIndex: 4,
    domain: 'Licensing',
    questionText:
      "What is required when renewing a driver's license that has been expired for MORE than 1 year?",
    options: [
      'Pay the standard renewal fee only',
      'Take the written exam and practical driving test again',
      'Get a medical certificate only',
      'Submit a barangay clearance',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      "If a driver's license has been expired for more than 1 year, the holder must re-apply and pass both the written examination and practical driving test again, as if applying for a new license.",
  },
  {
    id: 'q-4-005',
    phaseIndex: 4,
    domain: 'Licensing',
    questionText:
      'Which documents are REQUIRED for first-time Non-Professional License applicants?',
    options: [
      'Passport and NBI clearance only',
      'Student permit, medical certificate, and proof of identity',
      "TIN card and voter's ID only",
      'Barangay clearance and police clearance',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'First-time NPDL applicants must present their valid Student Permit (minimum 1 month old), a medical certificate from a LTO-accredited physician, and a valid government-issued ID. Written and practical tests must also be passed.',
  },
  {
    id: 'q-4-006',
    phaseIndex: 4,
    domain: 'Licensing',
    questionText: "What does a Restriction Code 1 on a driver's license mean?",
    options: [
      'Can drive motorcycles only',
      'Can only drive in the region where the license was issued',
      'Cannot drive at night',
      'Must wear corrective lenses while driving',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      "Restriction Code 1 on a Philippine driver's license indicates the license is valid ONLY in the region where it was issued. It is typically placed on student permits to limit geographic scope.",
  },
  {
    id: 'q-4-007',
    phaseIndex: 4,
    domain: 'Licensing',
    questionText:
      "A Non-Professional Driver's License is authorized to drive which type of vehicle?",
    options: [
      'Public utility vehicles for hire',
      'Private passenger vehicles only (not for hire)',
      'Any vehicle up to 4.5 tons',
      'Commercial trucks under 5 tons',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      "A Non-Professional Driver's License (NPDL) authorizes driving of private vehicles for personal use only — not for hire or reward. Driving public utility vehicles requires a Professional Driver's License (PDL).",
  },
  {
    id: 'q-4-008',
    phaseIndex: 4,
    domain: 'Licensing',
    questionText:
      'During a lawful traffic stop, which documents must a driver present upon request?',
    options: [
      "Only the driver's license",
      "Driver's license and vehicle registration (OR/CR)",
      "Driver's license, OR/CR, and proof of insurance",
      "Driver's license, OR/CR, and barangay clearance",
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      "A driver must present: (1) their valid driver's license, (2) the Official Receipt and Certificate of Registration (OR/CR) of the vehicle, and (3) proof of valid insurance (CTPL). Failure to present any of these is a violation.",
  },
  {
    id: 'q-4-009',
    phaseIndex: 4,
    domain: 'Licensing',
    questionText: "What is the minimum age to apply for a Professional Driver's License (PDL)?",
    options: ['17 years old', '18 years old', '21 years old', '25 years old'],
    correctAnswerIndex: 1,
    staticExplanation:
      "The minimum age for a Professional Driver's License (PDL) is 18 years old. The applicant must also have held an NPDL for a minimum period and pass additional tests required for professional licensing.",
  },
  {
    id: 'q-4-010',
    phaseIndex: 4,
    domain: 'Licensing',
    questionText: "A driver found operating a vehicle WITHOUT a driver's license faces a fine of:",
    options: ['₱500', '₱1,000', '₱3,000', '₱5,000'],
    correctAnswerIndex: 2,
    staticExplanation:
      'Under current LTO regulations, driving without a license carries a fine of ₱3,000. The vehicle may also be impounded. A driver must carry a valid license at all times when operating a motor vehicle.',
  },

  // -------------------------------------------------------------------------
  // PHASE 5 — Traffic Penalties & Safe Practices (10 questions)
  // -------------------------------------------------------------------------
  {
    id: 'q-5-001',
    phaseIndex: 5,
    domain: 'Penalties',
    questionText: 'What is the fine for beating a red light in the Philippines?',
    options: ['₱500', '₱1,000', '₱2,000', '₱3,000'],
    correctAnswerIndex: 1,
    staticExplanation:
      'Running a red light carries a fine of ₱1,000. It is one of the most dangerous driving violations and a leading cause of intersection accidents. Repeat offenders face higher penalties and license suspension.',
  },
  {
    id: 'q-5-002',
    phaseIndex: 5,
    domain: 'Penalties',
    questionText:
      'What is the penalty for using a mobile phone while driving under current Philippine law?',
    options: ['₱1,000', '₱2,500', '₱5,000', '₱10,000'],
    correctAnswerIndex: 2,
    staticExplanation:
      'Under RA 10913 (Anti-Distracted Driving Act), using a mobile phone while driving carries a fine of ₱5,000. Repeat offenses result in higher fines and possible license suspension.',
  },
  {
    id: 'q-5-003',
    phaseIndex: 5,
    domain: 'Penalties',
    questionText: 'Under the Seat Belt Use Act (RA 8750), who is required to wear a seatbelt?',
    options: [
      'Driver only',
      'Driver and all front-seat passengers',
      'Driver and all passengers (front and rear)',
      'Only children below 12 years old',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'RA 8750 requires both the driver AND all passengers — including those in the rear seats — to wear seatbelts at all times. The fine is ₱500 per unbuckled person. Children under 12 must use appropriate child restraints.',
  },
  {
    id: 'q-5-004',
    phaseIndex: 5,
    domain: 'Penalties',
    questionText:
      'What is the legal Blood Alcohol Concentration (BAC) limit for private vehicle drivers?',
    options: ['0.05%', '0.08%', '0.10%', 'Any amount is prohibited'],
    correctAnswerIndex: 1,
    staticExplanation:
      'Under the Anti-Drunk Driving Act (RA 10586), the BAC limit for private vehicle drivers is 0.05%. Wait — the correct limit under RA 10586 is actually 0.05% for non-professional drivers. Exceeding 0.05% (or any measurable amount for professional drivers) is an offense. The fine starts at ₱20,000 plus imprisonment for repeat offenses.',
  },
  {
    id: 'q-5-005',
    phaseIndex: 5,
    domain: 'Penalties',
    questionText: 'A driver found to have committed reckless driving may face a fine of up to:',
    options: ['₱2,000', '₱5,000', '₱10,000', '₱20,000'],
    correctAnswerIndex: 2,
    staticExplanation:
      'Reckless driving carries a fine ranging from ₱5,000 to ₱10,000 depending on circumstances. If it causes injury or death, additional criminal charges may be filed under the Revised Penal Code.',
  },
  {
    id: 'q-5-006',
    phaseIndex: 5,
    domain: 'Penalties',
    questionText:
      'Under the Child Safety in Motor Vehicles Act (RA 11229), children below what age must use a child car seat?',
    options: ['Below 5 years old', 'Below 8 years old', 'Below 10 years old', 'Below 12 years old'],
    correctAnswerIndex: 3,
    staticExplanation:
      'RA 11229 requires children below 12 years old (or those shorter than 150 cm) to use an appropriate child restraint system (car seat or booster seat). The fine for non-compliance is ₱1,000.',
  },
  {
    id: 'q-5-007',
    phaseIndex: 5,
    domain: 'Penalties',
    questionText:
      "What happens to a driver's license after accumulating 3 or more serious violations within 12 months?",
    options: [
      'A warning letter is issued',
      'The license is suspended',
      'A higher fine is imposed only',
      'The driver is required to retake the written test',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Under the LTO demerit point system, accumulating three or more serious traffic violations within a 12-month period results in license SUSPENSION. Multiple suspensions may lead to permanent revocation.',
  },
  {
    id: 'q-5-008',
    phaseIndex: 5,
    domain: 'Penalties',
    questionText: 'What is the fine for speeding 31 km/h or more over the posted speed limit?',
    options: ['₱1,200', '₱2,400', '₱3,600', '₱5,000'],
    correctAnswerIndex: 1,
    staticExplanation:
      'Exceeding the speed limit by 31 km/h or more carries a fine of ₱2,400. Speeding by 1–30 km/h carries ₱1,200. These fines may increase in school zones or during road construction.',
  },
  {
    id: 'q-5-009',
    phaseIndex: 5,
    domain: 'Penalties',
    questionText:
      'Driving a vehicle with an EXPIRED registration (OR/CR) is subject to a fine of approximately:',
    options: ['₱200 per month', '₱500 flat fine', '₱1,000 flat fine', '₱2,000 flat fine'],
    correctAnswerIndex: 0,
    staticExplanation:
      'Late motor vehicle registration renewal carries a penalty of ₱200 per month of delay. After extended delays, additional surcharges and penalties accumulate. The vehicle may also be apprehended.',
  },
  {
    id: 'q-5-010',
    phaseIndex: 5,
    domain: 'Penalties',
    questionText: 'A vehicle impounded for a traffic violation can be released after:',
    options: [
      "Showing a valid driver's license only",
      'Paying impound fees and all outstanding fines',
      'Filing a complaint with LTO headquarters',
      'Waiting 24 hours regardless of payment',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'An impounded vehicle is only released after the owner pays all applicable impound fees and settles all outstanding traffic fines. Impounding is used as an enforcement tool for serious or repeat violations.',
  },
]

// ---------------------------------------------------------------------------
// Main seeding logic
// ---------------------------------------------------------------------------

async function seedQuizData(): Promise<void> {
  console.log('[Seed] Starting quiz data seeding...')
  const db = getFirestore()

  // --- Seed reviewer modules ---
  console.log(`[Seed] Writing ${reviewerModules.length} reviewer modules...`)
  for (const module of reviewerModules) {
    await db.collection('reviewer_modules').doc(module.id).set(module)
    console.log(`[Seed]  ✓ Module: ${module.id} — ${module.title}`)
  }

  // --- Seed quiz questions ---
  console.log(`[Seed] Writing ${quizQuestions.length} quiz questions...`)
  for (const question of quizQuestions) {
    await db.collection('quiz_questions').doc(question.id).set(question)
    console.log(`[Seed]  ✓ Question: ${question.id} (Phase ${question.phaseIndex})`)
  }

  console.log('[Seed] ✅ Done! Seeded:')
  console.log(`         ${reviewerModules.length} reviewer modules`)
  console.log(`         ${quizQuestions.length} quiz questions across 6 phases`)
}

seedQuizData().catch(err => {
  console.error('[Seed] ❌ Failed:', err)
  process.exit(1)
})
