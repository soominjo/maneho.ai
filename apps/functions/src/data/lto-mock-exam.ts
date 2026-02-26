/**
 * LTO Mock Exam Data — FDM Vol. 1
 * 60 questions: Traffic Signs (20) · Emergencies (15) · Rules (25)
 *
 * Collection target: mock_exam_questions
 * Schema: QuizQuestionSchema — { id, domain, questionText, options, correctAnswerIndex, staticExplanation }
 */

import type { QuizQuestion } from '@repo/shared'

export const LTO_MOCK_EXAM_QUESTIONS: QuizQuestion[] = [
  // ===========================================================================
  // TRAFFIC SIGNS — 20 questions (me-001 to me-020)
  // ===========================================================================

  {
    id: 'me-001',
    domain: 'Traffic Signs',
    questionText: 'What is the standard shape of a WARNING sign in the Philippines?',
    options: [
      'Rectangle with a black border',
      'Diamond or triangle with a red border',
      'Circle with a red border',
      'Octagon with white letters',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Warning signs are diamond-shaped (in some countries) or triangular with a red border in the Philippines. They alert drivers to hazards or changing road conditions ahead, such as curves, intersections, or pedestrian crossings.',
  },
  {
    id: 'me-002',
    domain: 'Traffic Signs',
    questionText: 'The "Give Way" (Yield) sign in the Philippines is:',
    options: [
      'A red octagon',
      'An inverted triangle with a red border on a white background',
      'A yellow diamond with the word YIELD',
      'A blue circle with a white arrow',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'The Give Way or Yield sign is an inverted (upside-down) triangle with a red border. Unlike a Stop sign, it does not require a complete stop — only that you slow down and yield to traffic already on the priority road.',
  },
  {
    id: 'me-003',
    domain: 'Traffic Signs',
    questionText: 'A sign showing the letter "P" crossed out by a diagonal red bar means:',
    options: ['Paid parking zone', 'Permit parking only', 'No parking', 'Parking available nearby'],
    correctAnswerIndex: 2,
    staticExplanation:
      'A white rectangular sign with a red circle and diagonal bar over a "P" is the standard NO PARKING sign. Parking in this area is a traffic violation. It may be enforced at all times or during specified hours shown below the sign.',
  },
  {
    id: 'me-004',
    domain: 'Traffic Signs',
    questionText:
      'Green background signs on Philippine expressways and national highways are used for:',
    options: [
      'Warning of road hazards',
      'Indicating mandatory traffic rules',
      'Directional guidance, destinations, and distances',
      'Marking school zones and hospitals',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'Green signs are INFORMATIONAL/GUIDE signs. They tell drivers where they are, where to turn, and how far destinations are. They do not impose legal requirements but help with navigation.',
  },
  {
    id: 'me-005',
    domain: 'Traffic Signs',
    questionText: 'A railroad crossing advance warning sign typically displays:',
    options: [
      'A red octagon with "TRAIN" text',
      'A yellow diamond with an X or train/track symbol',
      'A blue circle with two parallel lines',
      'A white rectangle with the words "RAIL CROSSING"',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Railroad crossing warning signs are yellow diamonds featuring an "X" symbol (St. Andrew\'s cross) or a train silhouette. They warn drivers of an approaching crossing and require slowing down to check for trains before crossing.',
  },
  {
    id: 'me-006',
    domain: 'Traffic Signs',
    questionText: 'Blue circular signs on Philippine roads indicate:',
    options: [
      'Advisory recommendations',
      'Mandatory instructions that must be obeyed',
      'Road hazards and warnings',
      'Information for drivers',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Blue circular signs are MANDATORY signs. Whatever they show — a direction arrow, a minimum speed, lane designation, or vehicle type — must be followed. Disobeying a mandatory sign is a traffic violation.',
  },
  {
    id: 'me-007',
    domain: 'Traffic Signs',
    questionText:
      'A road sign showing two arrows pointing in opposite directions side by side means:',
    options: [
      'One-way road ahead',
      'Two-way traffic resumes or begins',
      'Road splits into two one-way roads',
      'Merging lanes',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'A sign with two opposing arrows warns drivers that a one-way section is ending and TWO-WAY TRAFFIC is resuming. Drivers must move to the correct lane and prepare for oncoming traffic.',
  },
  {
    id: 'me-008',
    domain: 'Traffic Signs',
    questionText: 'A red circle with a horizontal white bar across it (no markings inside) means:',
    options: [
      'No overtaking',
      'No parking',
      'No entry — do not enter this road',
      'Road ends ahead',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'The NO ENTRY sign is a red circle with a horizontal white bar. It prohibits vehicles from entering the road from that direction. It is commonly placed at the entrance of one-way roads to prevent wrong-way driving.',
  },
  {
    id: 'me-009',
    domain: 'Traffic Signs',
    questionText: 'A broken (dashed) white center line on a two-lane two-way road means:',
    options: [
      'Overtaking is prohibited at all times',
      'Overtaking is permitted when it is safe to do so',
      'The road narrows ahead',
      'Lanes are reserved for buses only',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'A broken white center line means overtaking IS PERMITTED when it is safe — meaning the road ahead is clear and visibility is sufficient. Drivers must still exercise caution and return to their lane before any oncoming traffic is endangered.',
  },
  {
    id: 'me-010',
    domain: 'Traffic Signs',
    questionText: 'What does a double solid yellow center line on a road mean?',
    options: [
      'Overtaking is allowed from the left side only',
      'Overtaking is allowed from the right side only',
      'Overtaking is prohibited from BOTH directions',
      'The road is a divided highway',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'A double solid yellow center line prohibits overtaking from BOTH directions. This marking is placed where sight distance is insufficient — near crests, curves, or narrow sections — making passing extremely dangerous.',
  },
  {
    id: 'me-011',
    domain: 'Traffic Signs',
    questionText:
      'A solid white transverse (crosswise) line across the road at an intersection is a:',
    options: [
      'Yield line — slow down before crossing',
      'Stop line — your vehicle must not pass it when stopping',
      'Pedestrian crossing boundary',
      'Speed bump marker',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'The solid white STOP LINE marks exactly where you must stop your vehicle. It is placed at intersections controlled by a stop sign or traffic signal. Your front bumper must not cross this line when stopped.',
  },
  {
    id: 'me-012',
    domain: 'Traffic Signs',
    questionText: 'Chevron alignment signs (rows of arrows on a curve) are what color?',
    options: [
      'White with black arrows',
      'Orange with black arrows',
      'Yellow with black arrows',
      'Red with white arrows',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'Chevron alignment signs are yellow with black arrows. They are placed on curves and bends to guide drivers along the correct path, warning them of the direction the road curves before the bend is fully visible.',
  },
  {
    id: 'me-013',
    domain: 'Traffic Signs',
    questionText: 'An orange sign along the road typically warns of:',
    options: [
      'School zones',
      'Road construction or maintenance work zones',
      'Hospital zones',
      'Expressway toll plazas',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Orange signs are used exclusively for TEMPORARY WORK ZONE warnings — road construction, maintenance operations, lane closures, and reduced speed limits due to road work. Always slow down in orange-zone areas; workers may be present.',
  },
  {
    id: 'me-014',
    domain: 'Traffic Signs',
    questionText:
      'What does a yellow sign with a silhouette of a person walking (pedestrian figure) indicate?',
    options: [
      'School zone — reduce speed to 20 km/h',
      'Pedestrian crossing area — watch for pedestrians',
      'No pedestrian access',
      'Sidewalk ends — pedestrians on road',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'A yellow pedestrian warning sign indicates a PEDESTRIAN CROSSING or area of heavy foot traffic. Drivers must slow down and be prepared to stop for pedestrians. Unlike a school zone sign, this may appear in any pedestrian-heavy area.',
  },
  {
    id: 'me-015',
    domain: 'Traffic Signs',
    questionText: 'A "NO U-TURN" sign is correctly described as:',
    options: [
      'A red octagon with the letter U',
      'A yellow diamond with a curved arrow and an X',
      'A circle with a U-shaped arrow overlaid with a red prohibition symbol',
      'A white rectangle with the words NO U-TURN in red',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'The NO U-TURN sign features a U-shaped arrow (representing the U-turn maneuver) covered by a red circle-and-diagonal-bar prohibition symbol. It is a regulatory sign that legally prohibits U-turns at that specific location.',
  },
  {
    id: 'me-016',
    domain: 'Traffic Signs',
    questionText: 'A yellow curb marking (painted yellow edge of the road) means:',
    options: [
      'Short-term parking allowed (maximum 15 minutes)',
      'Loading and unloading zone',
      'No stopping, standing, or parking at any time',
      'Parking allowed at night only',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'A yellow curb is the most restrictive parking restriction. It means NO STOPPING, STANDING, OR PARKING at any time. These are typically found at fire hydrants, bus stops, driveways, and emergency access zones.',
  },
  {
    id: 'me-017',
    domain: 'Traffic Signs',
    questionText:
      'Road markers called "cats eyes" or Raised Pavement Markers (RPMs) on the road surface serve to:',
    options: [
      'Mark speed bump locations',
      'Indicate where vehicles should stop at signals',
      'Reflect headlights to make lane boundaries visible at night and in rain',
      'Mark emergency vehicle pull-off zones',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'RPMs (cats eyes) are reflective devices embedded in the road surface. They reflect headlight beams back to the driver, making lane markings clearly visible in low-light conditions, rain, and fog — supplementing painted lines that become hard to see when wet.',
  },
  {
    id: 'me-018',
    domain: 'Traffic Signs',
    questionText:
      'A sign with a "P" inside a white rectangle with no prohibition symbol but with time restrictions below it means:',
    options: [
      'Parking is always prohibited',
      'Parking is permitted during the hours NOT listed',
      'Parking is permitted only during the hours listed',
      'Parking is free at all times',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'A parking sign with time restrictions specifies WHEN parking is permitted. For example, "7 AM–6 PM" means parking is allowed only during those hours. Outside those hours, the restriction lifts unless another sign applies.',
  },
  {
    id: 'me-019',
    domain: 'Traffic Signs',
    questionText: 'What shape is the standard STOP sign?',
    options: ['Circle', 'Triangle', 'Octagon', 'Diamond'],
    correctAnswerIndex: 2,
    staticExplanation:
      'The STOP sign is universally octagonal (8-sided) with a red background and white lettering. Its unique shape allows it to be recognized from any angle — even from the back — and is the same worldwide for universal recognition.',
  },
  {
    id: 'me-020',
    domain: 'Traffic Signs',
    questionText:
      'White diagonal lines inside a box junction (criss-cross markings painted on the road) mean you must:',
    options: [
      'Park here when directed by a traffic enforcer',
      'Not enter the box unless your exit is clear',
      'Stop within the box before making a turn',
      'Yield to pedestrians in the area',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'A box junction is marked with yellow or white criss-cross diagonal lines. You must NOT enter the box unless your exit road is completely clear. This prevents vehicles from blocking the intersection during heavy traffic, which causes gridlock.',
  },

  // ===========================================================================
  // EMERGENCIES — 15 questions (me-021 to me-035)
  // ===========================================================================

  {
    id: 'me-021',
    domain: 'Emergencies',
    questionText:
      'Your vehicle breaks down on a national highway at night. Where must you place your warning triangle?',
    options: [
      '10 meters behind the vehicle',
      'At least 50 meters behind the vehicle',
      'Directly behind the rear bumper',
      'On the roof of the vehicle',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Warning triangles must be placed at least 50 meters behind a disabled vehicle on a highway (farther on expressways — at least 100 meters) to give oncoming drivers enough time to slow down and change lanes safely.',
  },
  {
    id: 'me-022',
    domain: 'Emergencies',
    questionText: 'When should you use your hazard lights (four-way flashers)?',
    options: [
      'When driving in heavy traffic to warn other drivers',
      'When your vehicle is stopped or moving slowly due to an emergency, breakdown, or obstruction',
      'Whenever it is raining heavily',
      'When driving through a tunnel',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Hazard lights are for EMERGENCIES and situations where your vehicle poses an unexpected hazard — e.g., breakdown, being towed, a sudden stop on a highway, or when you are a hazard to other traffic. Using them in normal rain or traffic is discouraged as it disables your turn signals and can confuse other drivers.',
  },
  {
    id: 'me-023',
    domain: 'Emergencies',
    questionText:
      'Your accelerator pedal gets stuck in the open position while driving. What should you do?',
    options: [
      'Steer toward the guard rail to slow down through friction',
      'Shift to neutral (N), apply the brakes, and steer to a safe stop',
      'Turn the ignition off immediately at speed',
      "Open the driver's door and drag your foot on the ground",
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'If the accelerator sticks, shift to NEUTRAL immediately to disconnect engine power from the wheels, then apply the brakes firmly to stop the vehicle, and steer safely off the road. Turning off the ignition at speed is dangerous because it can lock the steering wheel on older vehicles.',
  },
  {
    id: 'me-024',
    domain: 'Emergencies',
    questionText:
      'You are first to arrive at a road accident with a seriously injured person. What is the FIRST action?',
    options: [
      'Move the injured person off the road immediately',
      'Call emergency services (911) and provide your location',
      'Take photos for insurance documentation',
      'Drive to the nearest hospital to report the accident',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'The first action is always to call emergency services (911 in the Philippines) and provide the exact location. Do NOT move injured persons unless they are in immediate danger (e.g., vehicle on fire) — improper movement can cause additional spinal or internal injuries.',
  },
  {
    id: 'me-025',
    domain: 'Emergencies',
    questionText:
      'You experience brake fade (brakes becoming less effective) on a long downhill slope. What should you do?',
    options: [
      'Shift to a higher gear and apply the footbrake harder',
      'Downshift to a lower gear to use engine braking and allow the brakes to cool',
      'Apply the handbrake fully to stop quickly',
      'Turn the steering wheel rapidly side to side to slow down through tire friction',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Brake fade occurs when brakes overheat from continuous use on long descents. Downshift to a lower gear to use ENGINE BRAKING — this slows the vehicle without using the footbrake and allows the brakes to cool. This is why "use low gear on steep descents" is a standard driving rule.',
  },
  {
    id: 'me-026',
    domain: 'Emergencies',
    questionText:
      'A rear tire blows out while you are driving at expressway speed. What is the correct response?',
    options: [
      'Brake hard immediately and pull over',
      'Grip the wheel firmly, ease off the gas without braking hard, and steer gently to the shoulder',
      'Accelerate briefly to stabilize and then brake',
      'Turn the wheel sharply opposite to the side of the blowout',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'In a rear blowout, hard braking can cause the rear to swing out of control. Grip the wheel firmly, do NOT brake suddenly — ease off the gas to let the car slow naturally while steering smoothly toward the shoulder. Apply brakes gently only after speed has reduced significantly.',
  },
  {
    id: 'me-027',
    domain: 'Emergencies',
    questionText: 'Smoke begins coming from your hood while driving. You should:',
    options: [
      'Open the hood immediately while driving to check the source',
      'Continue driving to the nearest garage',
      'Pull over, turn off the engine, exit the vehicle, and keep others away',
      'Pour water on the hood to cool it down while driving',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'Engine smoke signals a potential fire or serious mechanical failure. Pull over immediately, turn off the ignition (stops fuel flow), and get everyone clear of the vehicle. Do NOT open the hood if fire is suspected — oxygen can cause flames to flare. Call emergency services and keep a safe distance.',
  },
  {
    id: 'me-028',
    domain: 'Emergencies',
    questionText: 'Your car begins to hydroplane (skate on a film of water). What should you do?',
    options: [
      'Brake hard to stop the vehicle',
      'Accelerate to regain traction',
      'Ease off the gas gradually and avoid sudden steering or braking',
      'Turn the steering wheel sharply to break the water film',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'Hydroplaning means your tires have lost contact with the road surface. Any sudden input — braking or steering — will cause a spin. Ease off the gas gradually and hold the wheel straight until you feel traction return. Reducing speed on wet roads and maintaining proper tire tread prevents hydroplaning.',
  },
  {
    id: 'me-029',
    domain: 'Emergencies',
    questionText:
      'You are driving in very heavy rain with low visibility. The safest action is to:',
    options: [
      'Activate hazard lights and maintain normal speed',
      'Reduce speed significantly, increase following distance, and turn on headlights (not hazards)',
      'Pull over under a bridge or overpass and stop there',
      'Flash your high beams to signal your position to other drivers',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'In heavy rain: reduce speed (wet roads double stopping distance), increase following distance to at least 6 seconds, and turn on headlights so others can see you. Hazard lights are only for when you are stopped or nearly stopped, as they disable your turn signals. Parking under bridges creates dangerous obstructions.',
  },
  {
    id: 'me-030',
    domain: 'Emergencies',
    questionText:
      'The road ahead is completely flooded and you cannot see the road surface beneath the water. You should:',
    options: [
      'Follow the vehicle ahead through the flood at low speed',
      'Drive through quickly at higher speed so water does not enter the engine',
      'Turn around and find an alternate route — do not cross unknown floodwater',
      'Open all windows before crossing to equalize water pressure',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      '"Turn Around, Don\'t Drown." As little as 30 cm of flowing water can push a car off a bridge or into a ditch, and 60 cm can carry away most vehicles. You cannot judge depth or current from the surface. Always find an alternate route rather than risking crossing unknown floodwater.',
  },
  {
    id: 'me-031',
    domain: 'Emergencies',
    questionText:
      'After a vehicular collision, which information is legally required to be exchanged between drivers?',
    options: [
      'Home address and vehicle color only',
      "Name, contact number, driver's license number, plate number, and insurance details",
      'Vehicle brand and model only',
      'Occupation and employer information',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      "Philippine law requires drivers involved in an accident to exchange: full name, contact number, driver's license number, vehicle plate number, and insurance policy details (CTPL at minimum). Failure to provide this information may constitute hit-and-run.",
  },
  {
    id: 'me-032',
    domain: 'Emergencies',
    questionText:
      'You are involved in a minor accident with no injuries and both vehicles are driveable. On a busy road, what should you do?',
    options: [
      'Leave the vehicles exactly where they stopped and wait for police, blocking traffic',
      'Move vehicles to the roadside to clear traffic, photograph the scene, then exchange information',
      'Drive away since there are no injuries',
      'Call your insurance company and wait 30 minutes before moving the vehicles',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'For minor accidents with no injuries on busy roads, move driveable vehicles to the shoulder or side road to avoid obstructing traffic — but FIRST photograph the positions and damage. Then exchange information. Leaving vehicles blocking traffic is a secondary hazard and a violation.',
  },
  {
    id: 'me-033',
    domain: 'Emergencies',
    questionText: 'Your vehicle engine suddenly overheats while driving. The correct response is:',
    options: [
      'Immediately stop and pour cold water on the engine',
      'Turn on the heater (heater blower) and pull over when safe, then allow the engine to cool before opening the hood',
      'Continue driving; the engine will cool itself',
      'Rev the engine to circulate coolant faster',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      "Turning on the cabin heater draws heat away from the engine (it's an additional radiator). Pull over safely and turn off the engine. Never open the radiator cap while the engine is hot — pressurized coolant can cause severe burns. Allow the engine to cool for at least 30 minutes before checking the coolant level.",
  },
  {
    id: 'me-034',
    domain: 'Emergencies',
    questionText:
      'A driver who leaves the scene of an accident without rendering assistance or identifying themselves commits:',
    options: [
      'A minor infraction punishable by a warning only',
      'Hit-and-run — a serious offense with criminal and administrative penalties',
      'A civil offense with a maximum ₱500 fine',
      'No offense if no injuries occurred',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Hit-and-run is a serious violation in Philippine law. Penalties include fines of ₱10,000–₱50,000, license revocation, and potential criminal charges under the Revised Penal Code for "abandonment of one\'s victim." This applies even to accidents with no injuries.',
  },
  {
    id: 'me-035',
    domain: 'Emergencies',
    questionText: 'While driving, you suddenly feel extremely drowsy. What is the safest action?',
    options: [
      'Open the window and turn up the radio to stay alert',
      'Drink an energy drink while driving',
      'Pull over at a safe location, stop the engine, and rest before continuing',
      'Increase speed to complete the journey faster',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'Driver drowsiness is as dangerous as drunk driving. Stimulants and window-opening provide only brief, unreliable relief. The ONLY safe action is to pull over and REST. Drowsy driving is responsible for a significant proportion of fatal accidents, particularly on long highway drives.',
  },

  // ===========================================================================
  // RULES — 25 questions (me-036 to me-060)
  // ===========================================================================

  {
    id: 'me-036',
    domain: 'Rules',
    questionText:
      'What is the general speed limit within built-up areas (cities and municipalities) in the Philippines?',
    options: ['40 km/h', '50 km/h', '60 km/h', '80 km/h'],
    correctAnswerIndex: 2,
    staticExplanation:
      'Under RA 4136, the maximum speed limit within built-up areas (cities, municipalities, and their poblaciones) is 60 km/h, unless a lower limit is posted. School zones and hospital zones have lower mandatory limits.',
  },
  {
    id: 'me-037',
    domain: 'Rules',
    questionText: 'On Philippine expressways, what is the maximum speed limit for private cars?',
    options: ['80 km/h', '100 km/h', '120 km/h', '60 km/h'],
    correctAnswerIndex: 1,
    staticExplanation:
      'The maximum speed limit on Philippine expressways (NLEX, SLEX, TPLEX, etc.) for private cars is 100 km/h. Different limits apply for buses (90 km/h) and trucks (80 km/h). Always follow the posted speed limit signs on each expressway.',
  },
  {
    id: 'me-038',
    domain: 'Rules',
    questionText: 'The speed limit in a school zone during school hours is:',
    options: ['30 km/h', '40 km/h', '20 km/h', '50 km/h'],
    correctAnswerIndex: 2,
    staticExplanation:
      'School zones require a reduced speed of 20 km/h to protect children who may cross unexpectedly. This applies during school hours when children are present. Exceeding this limit is a serious violation subject to elevated fines.',
  },
  {
    id: 'me-039',
    domain: 'Rules',
    questionText:
      'At an intersection with a non-functional traffic light (signal blackout), drivers should:',
    options: [
      'The largest vehicle goes first',
      'Treat it as an all-way STOP sign — yield to the vehicle on the right',
      'The vehicle on the main road always has priority',
      'The first vehicle to arrive always has the right of way',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'When traffic signals are not working, the intersection is treated as an all-way STOP. All drivers must stop, then yield to the vehicle to their right (the standard right-of-way rule at uncontrolled intersections). If a traffic enforcer is present, follow their signals.',
  },
  {
    id: 'me-040',
    domain: 'Rules',
    questionText: 'How far from a fire hydrant is parking prohibited?',
    options: [
      '3 meters on each side',
      '5 meters on each side',
      '6 meters on each side',
      '10 meters on each side',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Philippine law prohibits parking within 5 meters of a fire hydrant on either side. Blocking a hydrant can delay firefighters in emergencies. Vehicles parked in violation may be towed immediately without warning.',
  },
  {
    id: 'me-041',
    domain: 'Rules',
    questionText: 'How far from an intersection corner is parking generally prohibited?',
    options: ['3 meters', '5 meters', '6 meters', '10 meters'],
    correctAnswerIndex: 1,
    staticExplanation:
      'Parking is prohibited within 5 meters of an intersection to maintain clear sight lines for turning vehicles. Vehicles parked too close to corners block the view of oncoming traffic, pedestrians, and cyclists, increasing accident risk.',
  },
  {
    id: 'me-042',
    domain: 'Rules',
    questionText: "When are you required to turn on your vehicle's headlights?",
    options: [
      'Only between midnight and 5 AM',
      'Only when visibility is below 200 meters',
      'From sunset to sunrise and whenever weather reduces visibility',
      'Only on unlit roads',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'Headlights must be used from sunset to sunrise (nighttime driving) AND whenever weather conditions — rain, fog, dust — reduce visibility, regardless of the time of day. Headlights help you see AND help others see you.',
  },
  {
    id: 'me-043',
    domain: 'Rules',
    questionText: 'When must you switch from high beam (bright lights) to low beam headlights?',
    options: [
      'Only when another vehicle is within 30 meters',
      'When an oncoming vehicle is within 100–150 meters or when following another vehicle closely',
      'High beams can always be used outside of city limits',
      'Only when the other driver flashes their lights at you',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'High beams must be dimmed to low beam when an oncoming vehicle is within approximately 100–150 meters (to avoid blinding the approaching driver) and when following another vehicle closely (to avoid blinding the driver ahead via their mirrors).',
  },
  {
    id: 'me-044',
    domain: 'Rules',
    questionText:
      'Under RA 10913 (Anti-Distracted Driving Act), which of the following IS allowed while driving?',
    options: [
      'Holding a mobile phone to make a call',
      'Using a mobile phone to browse social media',
      'Using a mobile phone mounted on the dashboard in hands-free mode for navigation',
      'Holding a tablet to read a map',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'RA 10913 prohibits HANDHELD use of any communication or entertainment device while driving. Navigation apps on a properly MOUNTED device used in hands-free mode are permitted. Any handheld use — including briefly glancing at a phone — is a violation.',
  },
  {
    id: 'me-045',
    domain: 'Rules',
    questionText: 'What is the minimum following distance rule in ideal driving conditions?',
    options: [
      '1-second rule — one second per 10 km/h of speed',
      '2-second rule',
      '3-second rule',
      '10-meter fixed distance',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'The 3-second rule is the minimum safe following distance in good conditions. Watch the vehicle ahead pass a fixed point, then count: if you reach that point before counting to three, you are following too closely. Double this distance in rain; triple it in fog.',
  },
  {
    id: 'me-046',
    domain: 'Rules',
    questionText:
      'You are turning RIGHT at an intersection. Which lane should you turn from and into?',
    options: [
      'From the leftmost lane into the far lane',
      'From the rightmost lane into the rightmost lane of the cross street',
      'From any lane into any available lane',
      'From the rightmost lane into the leftmost lane of the cross street',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'When turning RIGHT, you must: start from the rightmost lane available, keep the turn tight (close to the curb), and end in the rightmost lane of the destination road. Swinging wide on a right turn cuts into other lanes and can cause collisions.',
  },
  {
    id: 'me-047',
    domain: 'Rules',
    questionText:
      'On a multi-lane expressway, which lane is designated for slower-moving and heavy vehicles?',
    options: [
      'The leftmost (fastest) lane',
      'The center lane',
      'The rightmost lane',
      'Any lane they choose',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'On Philippine expressways, the RIGHTMOST lane is for slower-moving vehicles and heavy vehicles (trucks, buses). Lighter, faster vehicles use the left lanes for overtaking. Staying in the leftmost lane when not overtaking is also a violation ("road hogging").',
  },
  {
    id: 'me-048',
    domain: 'Rules',
    questionText:
      'You must signal at least how far in advance before making a turn or changing lanes?',
    options: ['10 meters', '30 meters', '50 meters', '100 meters'],
    correctAnswerIndex: 1,
    staticExplanation:
      'Philippine traffic rules require signaling at least 30 meters before a turn or lane change. This gives drivers behind and beside you sufficient time to react. Abrupt lane changes without signaling are a common cause of side-swipe accidents.',
  },
  {
    id: 'me-049',
    domain: 'Rules',
    questionText:
      'A driver using the emergency lane to bypass traffic congestion (non-emergency situation) is:',
    options: [
      'Allowed if traffic is stopped completely',
      'Allowed on Sundays and holidays only',
      'Prohibited and is a citable traffic violation',
      'Allowed if the driver uses hazard lights',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'Emergency lanes are strictly for EMERGENCIES ONLY — vehicle breakdowns, medical situations, and emergency vehicle passage. Using the emergency lane as a bypass during traffic is illegal and subject to traffic fines, impoundment, and can block access for genuine emergency vehicles.',
  },
  {
    id: 'me-050',
    domain: 'Rules',
    questionText: 'It is illegal to overtake another vehicle at which of the following locations?',
    options: [
      'On a straight road with good visibility',
      'On a road with a broken white center line',
      'At a pedestrian crossing, intersection, or railway level crossing',
      'When the vehicle ahead is traveling at 40 km/h',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'Overtaking is prohibited at pedestrian crossings (where pedestrians have right of way), intersections (unpredictable traffic movement), and railway crossings (trains cannot stop quickly). These are high-risk areas where overtaking can result in fatal collisions.',
  },
  {
    id: 'me-051',
    domain: 'Rules',
    questionText: 'Under RA 8750 (Seat Belt Use Act), who must wear a seatbelt?',
    options: [
      'The driver only',
      'The driver and front passenger only',
      'The driver and all passengers in the vehicle',
      'Only passengers over 18 years old',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'RA 8750 mandates seatbelt use for ALL occupants of a motor vehicle — driver and EVERY passenger, including those in the rear seats. The fine is ₱500 per unbuckled person. Children below 12 must use appropriate child restraint systems (RA 11229).',
  },
  {
    id: 'me-052',
    domain: 'Rules',
    questionText: 'Can you legally park on a bridge or within an intersection in the Philippines?',
    options: [
      'Yes, if no no-parking signs are posted',
      'Yes, briefly for loading and unloading only',
      'No — parking on bridges and within intersections is always prohibited',
      'Yes, but only at night',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'Parking on bridges, within intersections, on sidewalks, in front of driveways, or anywhere that obstructs traffic is ALWAYS prohibited under RA 4136, regardless of signage. These locations are inherently dangerous and obstruct traffic flow.',
  },
  {
    id: 'me-053',
    domain: 'Rules',
    questionText: 'When entering a roundabout, who must yield?',
    options: [
      'Vehicles already circulating inside the roundabout must yield to entering vehicles',
      'Vehicles entering the roundabout must yield to vehicles already circulating',
      'The vehicle entering from the largest road has priority',
      'The vehicle traveling faster has priority',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Vehicles ENTERING a roundabout must YIELD to all vehicles already circulating inside. This is the universal roundabout rule. Never force your way in — wait for a safe gap. Vehicles inside the roundabout have continuous right of way.',
  },
  {
    id: 'me-054',
    domain: 'Rules',
    questionText:
      'When making a left turn at a signalized intersection on a green light, you must yield to:',
    options: [
      'No one — green light gives you the right of way',
      'All oncoming vehicles traveling straight and pedestrians crossing',
      'Only commercial vehicles and buses',
      'Only vehicles turning from the opposite direction',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'A green light does not give left-turning vehicles priority. You must yield to ALL oncoming vehicles proceeding straight through the intersection AND to pedestrians crossing in your path. A left turn is always a yielding maneuver.',
  },
  {
    id: 'me-055',
    domain: 'Rules',
    questionText:
      'Under RA 10054 (Motorcycle Helmet Act), which type of helmet is required for riders?',
    options: [
      'Any bicycle helmet',
      'Any hard hat or construction helmet',
      'A standard protective motorcycle helmet that meets safety standards',
      'A helmet is required only for passengers, not riders',
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      'RA 10054 requires both the rider AND passenger to wear a STANDARD PROTECTIVE MOTORCYCLE HELMET that complies with the Philippine National Standard (PNS). Fashion helmets, open-face "salakot" helmets without certification, or bicycle helmets do not meet the requirement.',
  },
  {
    id: 'me-056',
    domain: 'Rules',
    questionText:
      'What is the maximum speed limit on an open national highway outside city limits?',
    options: ['60 km/h', '80 km/h', '100 km/h', '50 km/h'],
    correctAnswerIndex: 1,
    staticExplanation:
      'The maximum speed on an open national highway (rural, outside built-up areas) is 80 km/h for private vehicles, unless a lower speed is posted. Inside urban areas, the limit drops to 60 km/h.',
  },
  {
    id: 'me-057',
    domain: 'Rules',
    questionText: 'When may a driver legally use the horn?',
    options: [
      'Whenever you wish to alert other drivers of your presence',
      'Only when necessary to warn of danger — not for frustration or to rush pedestrians',
      'As much as needed in heavy traffic to speed up the flow',
      'Freely in all areas except hospital zones',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'The horn is a safety device and should be used ONLY when necessary to warn others of danger. Excessive or unnecessary honking is a traffic violation (noise nuisance). It should never be used aggressively or to express frustration.',
  },
  {
    id: 'me-058',
    domain: 'Rules',
    questionText:
      'Before overtaking a slow-moving vehicle on a two-lane road, which of the following must you confirm?',
    options: [
      'That you are traveling faster than the vehicle ahead',
      'That the road ahead is clear, there is no oncoming traffic, the center line permits overtaking, and you have enough speed to complete the pass safely',
      'That you have already signaled for at least 5 seconds',
      'That the vehicle ahead is traveling below 40 km/h',
    ],
    correctAnswerIndex: 1,
    staticExplanation:
      'Safe overtaking requires checking: the road ahead is clear of oncoming traffic for a sufficient distance, the center line marking permits overtaking (broken line), your vehicle has enough power to complete the pass quickly, and you signal before moving out. Rushing a pass is one of the leading causes of head-on collisions.',
  },
  {
    id: 'me-059',
    domain: 'Rules',
    questionText: 'A driver must carry which documents at all times when operating a vehicle?',
    options: [
      "Driver's license only",
      "Driver's license and Official Receipt (OR) only",
      "Driver's license, Official Receipt (OR), Certificate of Registration (CR), and proof of valid insurance (CTPL)",
      "Driver's license and barangay clearance",
    ],
    correctAnswerIndex: 2,
    staticExplanation:
      "Drivers must always carry: (1) their valid driver's license, (2) Official Receipt (OR) of vehicle registration, (3) Certificate of Registration (CR), and (4) valid CTPL insurance. Failure to present any of these during a lawful stop is a traffic violation.",
  },
  {
    id: 'me-060',
    domain: 'Rules',
    questionText:
      'A student driver with a Student Permit (SP) is prohibited from driving between which hours?',
    options: ['6 PM to 6 AM', '8 PM to 5 AM', '10 PM to 5 AM', '12 AM to 6 AM'],
    correctAnswerIndex: 2,
    staticExplanation:
      'Under RA 10930, Student Permit holders are prohibited from driving between 10 PM and 5 AM. This nighttime restriction limits learners to safer driving conditions. Additionally, student permit holders must always be accompanied by a licensed driver seated beside them.',
  },
]
