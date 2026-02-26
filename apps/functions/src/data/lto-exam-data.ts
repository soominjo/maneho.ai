/**
 * LTO Mock Exam Seed Data — FDM Vol. 1 (Non-Professional & Professional Light Vehicle)
 * 60 questions | Domains: Traffic Signs · Driving Rules · Emergencies · Fines & Penalties
 *
 * Each question matches QuizQuestionSchema:
 *   { id, domain, questionText, options: string[], correctAnswerIndex, staticExplanation }
 */

import type { QuizQuestion } from '@repo/shared'

export const LTO_EXAM_QUESTIONS: QuizQuestion[] = [
  // ===========================================================================
  // TRAFFIC SIGNS — 15 questions (ts-001 to ts-015)
  // ===========================================================================

  {
    id: 'ts-001',
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
      'A STOP sign (RA 4136) requires a complete stop before the stop line or crosswalk. You must yield to ALL traffic and pedestrians before proceeding — not just when other vehicles are visible.',
  },
  {
    id: 'ts-002',
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
    id: 'ts-003',
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
    id: 'ts-004',
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
    id: 'ts-005',
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
    id: 'ts-006',
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
    id: 'ts-007',
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
    id: 'ts-008',
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
    id: 'ts-009',
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
    id: 'ts-010',
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
  {
    id: 'ts-011',
    domain: 'Traffic Signs',
    questionText:
      'Regulatory signs in the Philippines are typically displayed on what background color?',
    options: ['Yellow', 'White', 'Blue', 'Green'],
    correctAnswerIndex: 1,
    staticExplanation:
      'Regulatory signs (such as speed limits, no-entry, and turn restrictions) are typically displayed on a WHITE background with black text or symbols, sometimes with a red border. They impose legal requirements on drivers.',
  },
  {
    id: 'ts-012',
    domain: 'Traffic Signs',
    questionText: 'A red circle with a diagonal red bar over a symbol means:',
    options: [
      'Warning — hazard ahead',
      'That action or vehicle type is prohibited',
      'Mandatory action required',
      'Information for drivers',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'A red circle with a diagonal bar (universal prohibition symbol) over any image means that action or vehicle type is FORBIDDEN. Examples: no parking, no motorcycles, no left turn. It is a prohibition sign.',
  },
  {
    id: 'ts-013',
    domain: 'Traffic Signs',
    questionText: 'What does a "NO U-TURN" sign look like?',
    options: [
      'Red octagon with the letter U',
      'White rectangular sign with the words ONLY printed on it',
      'A circular sign with a U-shaped arrow crossed by a red diagonal bar',
      'A yellow diamond with a curved arrow',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'A NO U-TURN sign shows a U-shaped arrow (indicating a U-turn maneuver) overlaid with a red prohibition circle and diagonal bar. It means making a U-turn at that location is illegal.',
  },
  {
    id: 'ts-014',
    domain: 'Traffic Signs',
    questionText:
      'At a pedestrian crossing with traffic signals, a steady GREEN pedestrian figure means:',
    options: [
      'Pedestrians must stop and wait',
      'Pedestrians may cross but must hurry',
      'Pedestrians may cross safely',
      'Vehicles have the right of way',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'A steady green (walking) pedestrian signal means it is safe for pedestrians to cross. Drivers must stop and yield. When the figure turns red, pedestrians must not start crossing and vehicles may proceed.',
  },
  {
    id: 'ts-015',
    domain: 'Traffic Signs',
    questionText: 'Orange-colored signs along the road typically indicate:',
    options: [
      'School zones and child safety areas',
      'Road construction or maintenance zones ahead',
      'Toll plaza and expressway entry points',
      'Tourist attractions and scenic routes',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Orange signs are used for road construction, maintenance, and work zone warnings. They are temporary signs alerting drivers to changed road conditions, reduced speed limits, or workers on the road.',
  },

  // ===========================================================================
  // DRIVING RULES — 20 questions (dr-001 to dr-020)
  // ===========================================================================

  {
    id: 'dr-001',
    domain: 'Driving Rules',
    questionText: 'What is the maximum speed limit on Philippine expressways?',
    options: ['80 km/h', '100 km/h', '120 km/h', '60 km/h'],
    correctAnswerIndex: 1,
    staticExplanation:
      'Under Philippine regulations, the maximum speed limit on expressways is 100 km/h. Exceeding this is a violation subject to fines. Some expressways may post different limits — always follow posted signs.',
  },
  {
    id: 'dr-002',
    domain: 'Driving Rules',
    questionText: 'What is the speed limit when passing through a school zone?',
    options: ['30 km/h', '40 km/h', '20 km/h', '50 km/h'],
    correctAnswerIndex: 2,
    staticExplanation:
      'The speed limit in a school zone is 20 km/h. School zones are designated areas around schools where children frequently cross. Exceeding this limit poses serious safety risks and carries heavy fines.',
  },
  {
    id: 'dr-003',
    domain: 'Driving Rules',
    questionText: 'On a two-lane road outside the city, on which side should you overtake?',
    options: [
      'On the right side of the vehicle ahead',
      'On the left side of the vehicle ahead',
      'Either side, depending on road width',
      'Only when the road is divided by a barrier',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'In the Philippines (right-hand drive, left-hand traffic convention on national roads), overtaking is done on the RIGHT side of the vehicle ahead (using the oncoming lane briefly). Always ensure the road ahead is clear.',
  },
  {
    id: 'dr-004',
    domain: 'Driving Rules',
    questionText: 'Where is it ILLEGAL to overtake another vehicle?',
    options: [
      'On a straight road with no oncoming traffic',
      'At the crest of a hill, curve, or intersection',
      'On a two-lane highway with a broken center line',
      'When traveling at 40 km/h',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Overtaking at the crest of a hill, around a curve, or at intersections is prohibited because visibility is limited. You cannot see oncoming traffic in time to avoid a collision.',
  },
  {
    id: 'dr-005',
    domain: 'Driving Rules',
    questionText: 'A solid yellow line on your side of the center line means:',
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
    id: 'dr-006',
    domain: 'Driving Rules',
    questionText: 'What is the minimum following distance rule in good weather conditions?',
    options: [
      '1 second behind the vehicle ahead',
      '2 seconds behind the vehicle ahead',
      '3 seconds behind the vehicle ahead',
      '5 meters behind the vehicle ahead',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'The 3-second rule is the minimum safe following distance. Pick a fixed point; when the vehicle ahead passes it, count to three. You should not reach that point before finishing. In rain or fog, double the distance.',
  },
  {
    id: 'dr-007',
    domain: 'Driving Rules',
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
    id: 'dr-008',
    domain: 'Driving Rules',
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
    id: 'dr-009',
    domain: 'Driving Rules',
    questionText:
      'What is the maximum speed limit on a national highway passing through an open rural area?',
    options: ['100 km/h', '80 km/h', '60 km/h', '50 km/h'],
    correctAnswerIndex: 1,
    staticExplanation:
      'The maximum speed on an open national highway (outside city limits) is 80 km/h. This applies unless a lower speed is posted. Inside cities or built-up areas, the default is 60 km/h.',
  },
  {
    id: 'dr-010',
    domain: 'Driving Rules',
    questionText: 'What should you do before merging onto an expressway from an on-ramp?',
    options: [
      'Stop at the end of the ramp and wait for a gap',
      'Accelerate to match expressway speed and merge into a gap',
      'Merge immediately regardless of traffic',
      'Use the emergency lane to gain speed',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'On an on-ramp, accelerate to match the speed of expressway traffic, check mirrors and blind spots, then merge smoothly into a safe gap. Stopping at the end of a ramp is dangerous and illegal.',
  },
  {
    id: 'dr-011',
    domain: 'Driving Rules',
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
    id: 'dr-012',
    domain: 'Driving Rules',
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
    id: 'dr-013',
    domain: 'Driving Rules',
    questionText: 'A pedestrian is crossing at a marked crosswalk. What must you do?',
    options: [
      'Honk to alert the pedestrian and proceed',
      'Slow down only if the pedestrian is directly in front of you',
      'Stop and yield to the pedestrian',
      'Continue — vehicles have right of way over pedestrians',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'Pedestrians in a marked crosswalk ALWAYS have the right of way. Drivers must stop and wait for them to fully cross. Failure to yield at crosswalks is a serious violation under RA 4136.',
  },
  {
    id: 'dr-014',
    domain: 'Driving Rules',
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
    id: 'dr-015',
    domain: 'Driving Rules',
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
    id: 'dr-016',
    domain: 'Driving Rules',
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
      'When a school bus activates its red flashing lights to load or unload students, ALL vehicles in both directions must stop completely. Do not proceed until the bus turns off its flashing lights and moves.',
  },
  {
    id: 'dr-017',
    domain: 'Driving Rules',
    questionText: 'When two vehicles reach a 4-way STOP sign at the same time, who goes first?',
    options: [
      'The heavier vehicle',
      'The vehicle with more passengers',
      'The vehicle on the right',
      'The vehicle that honks first',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'At a 4-way stop, when two vehicles arrive simultaneously, the vehicle on the RIGHT has the right of way. This is consistent with the general "yield to the right" rule at intersections.',
  },
  {
    id: 'dr-018',
    domain: 'Driving Rules',
    questionText:
      'You are exiting a private driveway onto a public road. Who has the right of way?',
    options: [
      'You do, because you are exiting',
      'Traffic on the public road',
      'Whoever is traveling faster',
      'You, if there is no oncoming vehicle within 50 meters',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Traffic on the public road always has the right of way over a vehicle exiting a driveway, parking lot, or private road. You must wait for a complete safe gap before entering the road.',
  },
  {
    id: 'dr-019',
    domain: 'Driving Rules',
    questionText: 'Under what condition is it legal to make a U-turn on a national highway?',
    options: [
      'Whenever there is no oncoming traffic visible',
      'Only at designated U-turn slots marked by traffic authorities',
      'Whenever the road is wide enough',
      'Anytime, as long as you signal first',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'U-turns on national highways are only permitted at designated U-turn slots established by traffic authorities (DPWH/MMDA). Making a U-turn anywhere else is illegal and dangerous.',
  },
  {
    id: 'dr-020',
    domain: 'Driving Rules',
    questionText: 'Which of the following is NOT an allowable reason to use the emergency lane?',
    options: [
      'Pulling over due to a vehicle breakdown',
      'Avoiding heavy traffic by using it as a regular travel lane',
      'Responding to a medical emergency as the vehicle involved',
      'Being directed to use it by a traffic enforcer',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Emergency lanes are reserved for genuine emergencies (breakdowns, medical situations, emergency vehicles). Using the emergency lane to skip traffic is illegal and is a citable offense under LTO regulations.',
  },

  // ===========================================================================
  // EMERGENCIES — 10 questions (em-001 to em-010)
  // ===========================================================================

  {
    id: 'em-001',
    domain: 'Emergencies',
    questionText:
      'Your vehicle breaks down on an expressway. What is the FIRST thing you should do?',
    options: [
      'Step out immediately and flag down other vehicles for help',
      'Attempt to continue driving slowly to the nearest exit',
      'Turn on hazard lights, move the vehicle to the shoulder, and place warning triangles',
      'Call your insurance company and wait inside the vehicle in the travel lane',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'In a breakdown, immediately activate hazard lights and safely move the vehicle to the shoulder or emergency lane. Place warning triangles at least 50 meters behind your vehicle to alert approaching traffic. Never stand in the travel lane.',
  },
  {
    id: 'em-002',
    domain: 'Emergencies',
    questionText: 'Your brakes fail while driving downhill. What is the correct action?',
    options: [
      'Turn off the ignition immediately',
      'Pump the brake pedal rapidly, downshift to a lower gear, and use the handbrake gradually',
      'Swerve sharply to create friction against the guardrail',
      'Open the car door and use it as a brake',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'If brakes fail: pump the brake pedal rapidly (may restore hydraulic pressure), downshift to a lower gear to use engine braking, and gradually apply the parking/handbrake. Steer toward a safe area or escape ramp if available. Never turn off the ignition at speed — this locks the steering wheel.',
  },
  {
    id: 'em-003',
    domain: 'Emergencies',
    questionText: 'A tire blows out at highway speed. What should you do?',
    options: [
      'Brake hard immediately and steer to the shoulder',
      'Grip the steering wheel firmly, ease off the accelerator gradually, and steer to the shoulder',
      'Accelerate briefly to stabilize the vehicle, then brake',
      'Turn the wheel sharply in the opposite direction of the blowout',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'During a blowout, do NOT brake hard — it can cause loss of control. Grip the wheel firmly, ease off the gas gradually to slow down naturally, and steer smoothly to the road shoulder. Apply brakes gently only after the vehicle has decelerated.',
  },
  {
    id: 'em-004',
    domain: 'Emergencies',
    questionText:
      'You witness a road accident with injured persons. What is your PRIMARY obligation?',
    options: [
      'Photograph the scene and post on social media to warn other drivers',
      'Drive away to avoid traffic obstruction',
      'Stop, call emergency services (911), and provide assistance without moving the injured unless in immediate danger',
      'Move the injured persons to a safe area immediately',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'As a witness, stop safely, call 911 (or local emergency), and offer assistance. Do NOT move injured persons unless they face immediate danger (e.g., fire) — moving trauma victims improperly can worsen spinal injuries. Wait for emergency responders.',
  },
  {
    id: 'em-005',
    domain: 'Emergencies',
    questionText:
      "Smoke begins coming from your vehicle's engine while you are driving. What should you do?",
    options: [
      'Continue driving to the nearest repair shop',
      'Pull over immediately, turn off the engine, exit the vehicle, and call for help',
      'Open the hood while driving to let the smoke out',
      'Pour water directly on the engine immediately',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Engine smoke may indicate fire or a cooling system failure. Pull over immediately, turn off the engine, and get everyone out of the vehicle. Do NOT open the hood if you suspect fire — a sudden oxygen rush can cause flames to flare. Call emergency services.',
  },
  {
    id: 'em-006',
    domain: 'Emergencies',
    questionText: 'Your vehicle begins to skid on a wet road. What is the correct response?',
    options: [
      'Brake hard and turn sharply in the opposite direction',
      'Ease off the accelerator and steer gently in the direction of the skid',
      'Accelerate to power out of the skid',
      'Apply the handbrake to stop the rear wheels from spinning',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'During a skid: ease off the gas and steer GENTLY in the direction your rear is sliding (into the skid). This helps realign the vehicle. Braking hard or turning sharply can worsen the skid and cause a spin. Smooth, controlled inputs are key.',
  },
  {
    id: 'em-007',
    domain: 'Emergencies',
    questionText:
      'You are driving and suddenly experience severe dizziness or chest pain. What should you do?',
    options: [
      'Continue driving carefully to a hospital',
      'Safely pull over, stop the vehicle, turn on hazard lights, and call for help',
      'Speed up to reach the nearest hospital faster',
      'Ask a passenger to steer while you rest',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'A medical emergency while driving is life-threatening. Safely guide the vehicle to the roadside, stop, activate hazard lights, and call emergency services (911). Never continue driving — loss of consciousness can cause a fatal crash.',
  },
  {
    id: 'em-008',
    domain: 'Emergencies',
    questionText: 'The road ahead is flooded and you cannot see the bottom. What should you do?',
    options: [
      'Drive through slowly at low speed following other vehicles',
      'Turn around; do not attempt to cross an unknown depth of floodwater',
      'Drive through quickly so the engine does not stall',
      'Open the car windows before crossing to equalize pressure',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      '"Turn Around, Don\'t Drown." As little as 30 cm of moving water can sweep a car off the road, and 60 cm can float most vehicles. You cannot judge the depth or current of floodwater by sight. Find an alternate route.',
  },
  {
    id: 'em-009',
    domain: 'Emergencies',
    questionText:
      'You are involved in a minor vehicular accident with no injuries. Under RA 10916 (Road Speed Limiter Act) and general traffic rules, what must you NOT do?',
    options: [
      'Exchange contact and insurance information with the other driver',
      'Leave the scene without reporting to authorities or exchanging information',
      'Place warning triangles behind your vehicles',
      'Take photos of the damage and road conditions',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Leaving the scene of an accident without reporting or exchanging information is a "hit-and-run" violation even for minor accidents. Penalties include fines of up to ₱10,000–₱50,000, license revocation, and potential criminal liability.',
  },
  {
    id: 'em-010',
    domain: 'Emergencies',
    questionText:
      'Your headlights suddenly fail while driving at night on an unlit road. What should you do?',
    options: [
      'Continue driving at reduced speed using only parking lights',
      'Brake suddenly to stop in the middle of the road',
      'Activate hazard lights, reduce speed, and pull over safely to the road shoulder',
      'Switch to high-beam fog lights and continue at normal speed',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'A headlight failure at night is a serious safety emergency. Activate hazard lights immediately to warn other drivers, reduce speed gradually, and pull over to the shoulder. Do not continue driving without headlights on unlit roads.',
  },

  // ===========================================================================
  // FINES & PENALTIES — 15 questions (fp-001 to fp-015)
  // ===========================================================================

  {
    id: 'fp-001',
    domain: 'Fines & Penalties',
    questionText: 'What is the fine for beating a red light in the Philippines?',
    options: ['₱500', '₱1,000', '₱2,000', '₱3,000'],
    correctAnswerIndex: 1,
    staticExplanation:
      'Running a red light carries a fine of ₱1,000. It is one of the most dangerous driving violations and a leading cause of intersection accidents. Repeat offenders face higher penalties and license suspension.',
  },
  {
    id: 'fp-002',
    domain: 'Fines & Penalties',
    questionText:
      'What is the penalty for using a mobile phone while driving under the Anti-Distracted Driving Act (RA 10913)?',
    options: ['₱1,000', '₱2,500', '₱5,000', '₱10,000'],
    correctAnswerIndex: 2,
    staticExplanation:
      'Under RA 10913 (Anti-Distracted Driving Act), using a mobile phone while driving carries a fine of ₱5,000. Repeat offenses result in higher fines (₱10,000 second offense, ₱15,000 third offense) and possible license suspension.',
  },
  {
    id: 'fp-003',
    domain: 'Fines & Penalties',
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
    id: 'fp-004',
    domain: 'Fines & Penalties',
    questionText:
      'What is the legal Blood Alcohol Concentration (BAC) limit for NON-PROFESSIONAL private vehicle drivers under RA 10586?',
    options: ['0.02%', '0.05%', '0.08%', '0.10%'],
    correctAnswerIndex: 1,
    staticExplanation:
      'Under the Anti-Drunk and Drugged Driving Act (RA 10586), the BAC limit for non-professional drivers is 0.05%. Professional drivers and those carrying passengers must have 0.00% BAC. Exceeding the limit results in fines starting at ₱20,000 plus imprisonment for repeat offenses.',
  },
  {
    id: 'fp-005',
    domain: 'Fines & Penalties',
    questionText: 'A driver found to have committed reckless driving may face a fine of up to:',
    options: ['₱2,000', '₱5,000', '₱10,000', '₱20,000'],
    correctAnswerIndex: 2,
    staticExplanation:
      'Reckless driving carries a fine ranging from ₱5,000 to ₱10,000 depending on circumstances. If it causes injury or death, additional criminal charges may be filed under the Revised Penal Code.',
  },
  {
    id: 'fp-006',
    domain: 'Fines & Penalties',
    questionText:
      'Under the Child Safety in Motor Vehicles Act (RA 11229), children below what age must use a child car seat?',
    options: ['Below 5 years old', 'Below 8 years old', 'Below 10 years old', 'Below 12 years old'],
    correctAnswerIndex: 3,
    staticExplanation:
      'RA 11229 requires children below 12 years old (or those shorter than 150 cm) to use an appropriate child restraint system (car seat or booster seat). The fine for non-compliance is ₱1,000 for the first offense.',
  },
  {
    id: 'fp-007',
    domain: 'Fines & Penalties',
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
    id: 'fp-008',
    domain: 'Fines & Penalties',
    questionText: 'What is the fine for speeding 31 km/h or more over the posted speed limit?',
    options: ['₱1,200', '₱2,400', '₱3,600', '₱5,000'],
    correctAnswerIndex: 1,
    staticExplanation:
      'Exceeding the speed limit by 31 km/h or more carries a fine of ₱2,400. Speeding by 1–30 km/h carries ₱1,200. These fines may increase in school zones or during road construction.',
  },
  {
    id: 'fp-009',
    domain: 'Fines & Penalties',
    questionText:
      'Driving a vehicle with an EXPIRED registration (OR/CR) is subject to a penalty of approximately:',
    options: ['₱200 per month of delay', '₱500 flat fine', '₱1,000 flat fine', '₱2,000 flat fine'],
    correctAnswerIndex: 0,
    staticExplanation:
      'Late motor vehicle registration renewal carries a penalty of ₱200 per month of delay. After extended delays, additional surcharges accumulate. The vehicle may also be impounded by traffic enforcers.',
  },
  {
    id: 'fp-010',
    domain: 'Fines & Penalties',
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
  {
    id: 'fp-011',
    domain: 'Fines & Penalties',
    questionText:
      "A driver found operating a vehicle WITHOUT a valid driver's license faces a fine of:",
    options: ['₱500', '₱1,000', '₱3,000', '₱5,000'],
    correctAnswerIndex: 2,
    staticExplanation:
      'Under current LTO regulations, driving without a valid license carries a fine of ₱3,000. The vehicle may also be impounded. A driver must carry a valid license at all times when operating a motor vehicle.',
  },
  {
    id: 'fp-012',
    domain: 'Fines & Penalties',
    questionText:
      'What is the penalty for a motorcycle rider or passenger caught NOT wearing a helmet (RA 10054)?',
    options: ['₱250', '₱500', '₱1,500', '₱3,000'],
    correctAnswerIndex: 1,
    staticExplanation:
      'Under RA 10054 (Motorcycle Helmet Act), riding without a standard protective helmet is punishable by a fine of ₱500 for the first offense, ₱750 for the second, and ₱1,500 for the third offense plus license suspension.',
  },
  {
    id: 'fp-013',
    domain: 'Fines & Penalties',
    questionText:
      'A driver is caught driving without Compulsory Third Party Liability (CTPL) insurance. The fine is:',
    options: ['₱500', '₱1,000', '₱2,500', '₱5,000'],
    correctAnswerIndex: 2,
    staticExplanation:
      'CTPL insurance is mandatory for all registered motor vehicles under the Insurance Code. Driving without valid CTPL insurance carries a fine of approximately ₱2,500 and the vehicle may be detained until insurance is obtained.',
  },
  {
    id: 'fp-014',
    domain: 'Fines & Penalties',
    questionText:
      'Under the Anti-Drunk and Drugged Driving Act (RA 10586), what is the penalty for a FIRST offense of driving under the influence?',
    options: [
      'Fine of ₱5,000 only',
      'License suspension for 3 months only',
      'Fine of ₱20,000, license suspension of 12 months, and mandatory drug/alcohol rehabilitation',
      'Community service for 30 days only',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      "Under RA 10586, a first-time DUI conviction results in: a fine of ₱20,000, suspension of the driver's license for 12 months, and mandatory rehabilitation. Second offenses carry heavier fines, longer suspensions, and imprisonment.",
  },
  {
    id: 'fp-015',
    domain: 'Fines & Penalties',
    questionText:
      'A driver who commits a hit-and-run (leaves the scene of an accident without identifying themselves) faces:',
    options: [
      'A warning and a ₱1,000 fine',
      'A fine of ₱3,000 and 30 days license suspension',
      'A fine of up to ₱50,000, license revocation, and possible criminal charges',
      "Mandatory retaking of the driver's license exam",
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      "Hit-and-run is one of the most serious traffic violations in the Philippines. It carries a fine of ₱10,000–₱50,000, automatic revocation of the driver's license, and potential criminal charges for abandonment of the victim under the Revised Penal Code.",
  },
]
