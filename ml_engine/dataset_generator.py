import json
import os
import random
import uuid

DEPARTMENTS = {
    "Flight Operations": {
        "mentor_roles": ["Fleet Captain", "Line Captain", "Type Rating Instructor (TRI)", "Chief Pilot"],
        "mentee_roles": ["First Officer", "Junior First Officer", "Cadet Pilot", "Second Officer"],
        "certifications": ["ATPL", "ICAO Level 6", "B787 Type Rating", "B737 Type Rating", "E190 Rating", "MCC", "IR"],
        "mentor_bios": [
            "Senior Line Captain on the B787 Dreamliner fleet with over 12,000 hours of commercial operations. Specializing in long-haul route navigation, command preparation, and cockpit resource management (CRM). Passionate about guiding junior flight crew through command transition.",
            "Experienced B737 Fleet Captain and Type Rating Instructor (TRI). Dedicated to mentorship around line-oriented flight training (LOFT), simulator evaluations, and standard operating procedures (SOPs) under KCAA/ICAO regulations.",
            "Long-haul commercial captain operating wide-body twin-aisle aircraft. Strong focus on high-altitude meteorology, ETOPS operational planning, and crew situational awareness."
        ],
        "mentee_bios": [
            "Commercial First Officer on regional jet equipment preparing for narrow-body B737 line conversion. Seeking guidance on standard instrument departures, simulator checks, and command upgrade pathways.",
            "Recently licensed commercial pilot holding ATPL with Multi-Crew Cooperation (MCC) training. Looking for a mentor to assist with international oceanic flight planning and turbine transition.",
            "Junior First Officer flying E190 fleet with 1,500 flight hours. Eager to master cockpit automation, FMC database programming, and line training workflows from experienced wide-body captains."
        ]
    },
    "Technical and Maintenance Engineering": {
        "mentor_roles": ["Licensed Aircraft Maintenance Engineer (LAME)", "Avionics Specialist", "Quality Assurance Inspector", "Powerplant Systems Lead"],
        "mentee_roles": ["Apprentice Aircraft Technician", "Junior Maintenance Engineer", "Graduate Avionics Trainee", "Structural Repair Assistant"],
        "certifications": ["KCAA Part 66 License", "EASA B1.1", "EASA B2", "Turbine Engine Overhaul", "NDT Level II"],
        "mentor_bios": [
            "Lead Aircraft Maintenance Engineer with 15 years overseeing base maintenance on modern commercial jetliners. Specialized in GEnx and CFM56 engine diagnostics, scheduled A/C checks, and regulatory airworthiness compliance.",
            "Senior Avionics Maintenance Specialist focusing on digital flight control computers, radar navigation arrays, and automated landing instruments. Experienced in mentoring apprentice technicians through troubleshooting methodologies.",
            "Aviation Quality Assurance and Safety Inspector. Extensive background in aircraft structural defect analysis, maintenance documentation compliance, and KCAA safety auditing."
        ],
        "mentee_bios": [
            "Graduate avionics engineering trainee seeking practical knowledge in electrical flight instrument diagnosis, line maintenance checks, and digital bus troubleshooting.",
            "Apprentice aircraft technician working toward KCAA Part 66 certification. Wanting mentorship in gas turbine powerplant teardown, borescope inspections, and defect logging.",
            "Junior maintenance technician assisting in scheduled heavy maintenance checks. Seeking guidance on aircraft hydraulic line repairs, structural skin riveting, and airworthiness directives."
        ]
    },
    "Corporate and Airline Operations": {
        "mentor_roles": ["Flight Operations Dispatch Lead", "Crew Scheduling Manager", "Network Planning Specialist", "Airline Safety Manager"],
        "mentee_roles": ["Assistant Flight Dispatcher", "Junior Crew Scheduler", "Revenue Management Analyst", "Flight Operations Intern"],
        "certifications": ["Flight Operations Officer (FOO) License", "IATA Dangerous Goods Regulations", "Safety Management Systems (SMS)"],
        "mentor_bios": [
            "Senior Flight Dispatcher and Operations Control Manager with comprehensive experience in fuel tankering optimization, international overflight permit clearances, and flight dispatch release procedures under ICAO Annex 6.",
            "Crew Resources and Scheduling Superintendent with extensive experience in pairing optimization, crew duty limitation regulations, and disruption management during irregular operations (IROPS).",
            "Aviation Safety Management Systems (SMS) Coordinator leading incident investigation, hazard identification, and corporate safety culture initiatives."
        ],
        "mentee_bios": [
            "Junior flight operations officer trainee looking to understand dynamic flight plan recalculation, tactical weather avoidance, and payload calculation.",
            "Crew scheduling assistant seeking mentorship in algorithmic crew rostering, duty rest compliance, and crew recovery during operational delays.",
            "Airline operations graduate intern focused on network revenue analytics, schedule reliability improvements, and airport slot management."
        ]
    }
}

def generate_dataset(total_records=500):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(base_dir, "..", "data", "synthetic_profiles.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    profiles = []
    records_per_dept = total_records // len(DEPARTMENTS)

    for dept, data in DEPARTMENTS.items():
        for i in range(records_per_dept):
            is_mentor = (i % 2 == 0)
            role_type = "mentor" if is_mentor else "mentee"

            job_titles = data["mentor_roles"] if is_mentor else data["mentee_roles"]
            bio_pool = data["mentor_bios"] if is_mentor else data["mentee_bios"]
            exp_range = (8, 22) if is_mentor else (1, 4)

            profile = {
                "profile_id": str(uuid.uuid4()),
                "user_id": str(uuid.uuid4()),
                "role": role_type,
                "full_name": f"{'Capt. ' if is_mentor and dept == 'Flight Operations' else ''}User_{role_type}_{dept[:3]}_{i+1}",
                "department": dept,
                "job_title": random.choice(job_titles),
                "years_experience": random.randint(*exp_range),
                "certifications": ", ".join(random.sample(data["certifications"], k=min(2, len(data["certifications"])))),
                "raw_bio": random.choice(bio_pool)
            }
            profiles.append(profile)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(profiles, f, indent=2)

    print(f"Successfully generated {len(profiles)} synthetic profiles -> {output_path}")

if __name__ == "__main__":
    generate_dataset(500)