/**
 * Sample LTO Documents for RAG Ingestion
 * These are simplified versions of real LTO regulations
 * Use this to populate your RAG database for testing
 */

export const SAMPLE_LTO_DOCUMENTS = [
  {
    documentId: 'lto-vehicle-registration-2024',
    text: `VEHICLE REGISTRATION REQUIREMENTS - 2024

    Philippine Land Transportation Office (LTO) Guidelines for Vehicle Registration

    REGISTRATION FEE STRUCTURE:
    - Private vehicles (Sedan): ₱2,500 - ₱3,500 depending on engine capacity
    - Motorcycles: ₱1,000 - ₱2,000
    - Tricycles: ₱500 - ₱1,500
    - Commercial vehicles: ₱4,000 - ₱8,000

    REQUIRED DOCUMENTS:
    1. Proof of ownership (Certificate of Registration or official receipt)
    2. Proof of identification (PRC ID, Passport, Driver's License, or Voter's ID)
    3. Proof of address (utility bill, latest tax return, barangay certification)
    4. Emission test certificate (for vehicles over 3 years old)
    5. Anti-theft device inspection (optional but required for some vehicle types)

    RENEWAL PROCESS:
    - Registration must be renewed annually
    - Can be done online through LTO's electronic system
    - Grace period: 60 days after expiration
    - Late payment penalty: ₱500 to ₱5,000 depending on number of months overdue

    DOCUMENTARY STAMP TAX:
    - 1.5% of the assessed value of the vehicle
    - Minimum: ₱50
    - Maximum: ₱1,000

    TRANSFER OF OWNERSHIP:
    - Seller must obtain clearance certificate
    - Buyer must register within 15 days of purchase
    - Failure to transfer: ₱1,000 penalty per day
    - Original owner remains responsible for vehicle violations until transfer is completed
    `,
    metadata: {
      documentType: 'regulation',
      year: 2024,
      jurisdiction: 'Philippines',
      date: '2024-01-01',
    },
  },
  {
    documentId: 'lto-traffic-violations-2024',
    text: `TRAFFIC VIOLATIONS AND PENALTIES - 2024

    Philippine Land Transportation Office (LTO) Traffic Enforcement Guidelines

    MINOR VIOLATIONS:
    1. Expired vehicle registration: ₱500 - ₱1,000
    2. Missing or improper license plate: ₱500 - ₱1,000
    3. Invalid driving license: ₱500 - ₱2,000
    4. Improper parking: ₱250 - ₱500
    5. Obstruction of traffic: ₱500 - ₱1,000

    MAJOR VIOLATIONS:
    1. Reckless driving: ₱5,000 - ₱10,000 and/or license suspension
    2. Driving under the influence of alcohol: ₱10,000 - ₱20,000 and license revocation
    3. Driving without license: ₱3,000 - ₱5,000
    4. Hit and run: ₱10,000 - ₱50,000 and possible license revocation
    5. Overspeeding:
       - 11-20 km/h over limit: ₱500
       - 21-30 km/h over limit: ₱1,000
       - Over 31 km/h: ₱2,000
    6. Illegal vehicle modification: ₱3,000 - ₱5,000

    SPEED LIMITS:
    - Residential areas: 20 km/h
    - School zones: 20 km/h
    - Business/commercial districts: 30 km/h
    - Highways (divided): 60 km/h
    - Highways (undivided): 40 km/h

    SPECIAL REGULATIONS:
    - Seatbelt use mandatory: ₱500 penalty
    - Child restraints required for children under 12: ₱1,000 penalty
    - Helmet use for motorcycle riders: ₱500 penalty
    - Mobile phone use while driving: ₱1,000 penalty

    DEMERIT POINTS SYSTEM:
    - Minor violations: 1-3 points
    - Major violations: 5-10 points
    - License suspension upon reaching 15 points
    - License revocation upon reaching 20 points

    CONDUCTION OF VIOLATIONS:
    - Traffic enforcers must issue tickets within 2 hours of violation
    - Violators have 10 days to pay fines
    - 20% discount for early payment (within 3 days)
    `,
    metadata: {
      documentType: 'regulation',
      year: 2024,
      jurisdiction: 'Philippines',
      date: '2024-03-15',
    },
  },
  {
    documentId: 'lto-drivers-license-requirements',
    text: `DRIVER'S LICENSE REQUIREMENTS - Philippine LTO

    Categories of Driver's Licenses and Requirements

    STUDENT PERMIT (SP):
    - Valid for 1 year
    - For first-time learners
    - Requirements:
      * Medical certificate (valid for 6 months)
      * NBI clearance
      * Birth certificate
      * Proof of residency
    - Fee: ₱500
    - Valid only when accompanied by professional/non-professional driver

    NON-PROFESSIONAL LICENSE:
    - Valid for 5 years
    - For personal vehicle use only
    - Requirements:
      * Medical certificate
      * NBI clearance
      * Valid identification
      * Proof of address
      * Passing written and driving tests
    - Fee: ₱1,500
    - Renewal fee: ₱1,200

    PROFESSIONAL LICENSE:
    - Valid for 5 years
    - For driving as occupation (taxi, bus, delivery, etc.)
    - Requirements:
      * Medical certificate
      * NBI clearance
      * Non-professional license (valid)
      * Professional driving school completion certificate
      * Passing professional driving test
      * Existing professional license (for renewal)
    - Fee: ₱2,500
    - Renewal fee: ₱2,000

    SPECIAL CLASS LICENSES:
    - Motorcycle license (Class C): Valid only for motorcycles
    - Heavy equipment operator (Class D-E-F): For commercial vehicles
    - Bus/truck operator (Class A-B): For public transport

    MEDICAL EXAMINATION:
    - Must include:
      * Vision test (must be 20/40 or better, correctable)
      * Hearing test
      * Blood pressure check
      * Physical examination
    - Valid for 6 months
    - Cost: ₱200-300 at LTO-accredited clinics

    VALIDITY AND RENEWAL:
    - Student Permit: Non-renewable
    - Non-professional: Renewable every 5 years
    - Professional: Renewable every 5 years
    - Late renewal penalty: ₱500 per year overdue
    - Maximum late payment period: 3 years, then must retake test

    SUSPENSION/REVOCATION:
    - 15 demerit points: License suspension (6 months)
    - 20 demerit points: License revocation (1 year)
    - DUI conviction: Automatic revocation (minimum 1 year)
    `,
    metadata: {
      documentType: 'regulation',
      year: 2024,
      jurisdiction: 'Philippines',
      date: '2024-02-01',
    },
  },
  {
    documentId: 'lto-vehicle-inspection-standards',
    text: `VEHICLE INSPECTION STANDARDS - LTO Safety and Emission Standards

    ROADWORTHINESS INSPECTION (RWI) REQUIREMENTS:

    MECHANICAL COMPONENTS:
    - Brakes: Must stop vehicle in 50 meters from 40 km/h
    - Steering: Smooth, responsive, no play exceeding 10 degrees
    - Tires: Minimum tread depth of 2mm, no damage or bulges
    - Lights: Headlights, brake lights, signal lights fully functional
    - Mirrors: All mirrors present and properly adjusted
    - Wipers: Functional and visible
    - Horn: Functional and audible

    EMISSION TEST (ET) REQUIREMENTS:
    - For vehicles 3 years and older
    - Test measures:
      * Carbon monoxide (CO): Maximum 0.5%
      * Hydrocarbon (HC): Maximum 100 ppm
      * Opacity (for diesel vehicles): Maximum 40%
    - Test valid for 1 year
    - Cost: ₱500-700 at authorized testing centers
    - Failure: Must repair and re-test within 30 days

    BODY INSPECTION:
    - No sharp edges or damage that could injure
    - No excessive rust affecting structural integrity
    - Frame straightness check for accident vehicles
    - Clear windshield (minimum 70% transparency)

    ANTI-THEFT DEVICE (optional but encouraged):
    - Dashboard immobilizer
    - GPS tracking system
    - Steering wheel lock
    - Alarm system
    - Installation cost: ₱3,000-8,000

    INSPECTION VALIDITY:
    - RWI: Valid for 12 months
    - Emission Test: Valid for 12 months
    - Both tests required annually for registration renewal
    - Failed inspection cannot be registered

    SPECIAL VEHICLES:
    - Vehicles modified from original specification must pass additional inspection
    - Lift kits, widened chassis, different engines require special approval
    - Non-conforming modifications: ₱3,000-5,000 fine and may be impounded
    `,
    metadata: {
      documentType: 'regulation',
      year: 2024,
      jurisdiction: 'Philippines',
      date: '2024-01-10',
    },
  },
  {
    documentId: 'lto-accident-procedures',
    text: `ACCIDENT PROCEDURES AND REPORTING - LTO Guidelines

    IMMEDIATE ACTIONS AFTER AN ACCIDENT:
    1. Check for injuries and call ambulance if needed (117 or local emergency)
    2. Call police (PNP) immediately for traffic accident report
    3. Move vehicles to safety if possible (but note original positions first)
    4. Exchange information with other parties:
       - Name and contact number
       - Vehicle plate number
       - Insurance company and policy number
       - Driver's license information
    5. Take photos of:
       - Vehicle damage from multiple angles
       - Overall accident scene
       - Road conditions and traffic signals
       - Position of vehicles
       - Witness contact information

    POLICE ACCIDENT REPORT:
    - PNP Traffic Enforcement Group (TEG) must investigate
    - Report filed at nearest police station
    - Request copy of the police report
    - Usually takes 3-5 business days
    - Cost: Free (sometimes small donation requested)

    INSURANCE CLAIM PROCESS:
    1. Notify insurance company within 24 hours
    2. Submit:
       - Police accident report
       - Insurance claim form
       - Photos of damage
       - Medical bills (if applicable)
       - Proof of expenses
    3. Insurance adjuster will assess damage
    4. Claim settlement: 10-30 days typically
    5. Third-party liability coverage required by law

    LIABILITY DETERMINATION:
    - At-fault driver responsible for all damages to other vehicles/property
    - Penalties for hit-and-run:
      * Fine: ₱10,000-50,000
      * License suspension/revocation
      * Criminal charges possible
    - Damages recovery:
      * Repair costs
      * Medical expenses
      * Lost income (documented)
      * Pain and suffering (limited in Philippines)

    THIRD PARTY LIABILITY INSURANCE:
    - Mandatory for all registered vehicles
    - Minimum coverage: ₱25,000
    - Annual premium: ₱500-1,500 depending on vehicle type
    - Covers damages to other persons/vehicles
    - Does NOT cover your own vehicle damage (need comprehensive policy)

    DOCUMENTATION FOR RECOVERY:
    - Police report with case number
    - Photos of damage and scene
    - Medical certificates and bills
    - Repair quotations from authorized mechanics
    - Proof of loss (receipts, invoices)
    - Insurance policy copy
    - Driver's license and vehicle registration copies
    `,
    metadata: {
      documentType: 'memorandum',
      year: 2024,
      jurisdiction: 'Philippines',
      date: '2024-02-20',
    },
  },
]
