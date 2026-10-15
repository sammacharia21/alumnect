import json
import os
import random
import uuid

FIRST_NAMES = [
    "David", "Sarah", "James", "Amina", "Michael", "Grace", "Samuel", "Fatima",
    "Brian", "Elena", "Daniel", "Zainab", "Kevin", "Rachel", "Joseph", "Nadia",
    "John", "Faith", "Peter", "Leila", "Anthony", "Mercy", "Robert", "Halima",
    "Eric", "Sonia", "Dennis", "Mariam", "Marcus", "Valerie", "Patrick", "Layla"
]

LAST_NAMES = [
    "Mwangi", "Kimani", "Ochieng", "Al-Mansoor", "Kariuki", "Chen", "Otieno",
    "Vance", "Mutua", "Kiprop", "Wambui", "Harrison", "Odhiambo", "Rostova",
    "Kamau", "Ahmed", "Njoroge", "Dubois", "Wekesa", "Kowalski", "Maina", "Bakari"
]

DEPARTMENTS = {
    "Flight Operations": {
        "mentor_roles": ["Fleet Captain", "Line Captain", "Type Rating Instructor (TRI)", "Chief Pilot", "Line Check Airman"],
        "mentee_roles": ["First Officer", "Junior First Officer", "Cadet Pilot", "Second Officer", "Transitioning Pilot"],
        "certifications": ["ATPL", "ICAO Level 6", "B787 Type Rating", "B737 Type Rating", "E190 Rating", "MCC", "IR", "CAT III Approval"],
        "fleets": ["Boeing B787 Dreamliner", "Boeing B737-800 NG", "Boeing B777-300ER", "Airbus A320neo", "Airbus A350-900", "Embraer E190", "Bombardier Q400"],
        "mentor_intros": [
            "Senior commercial captain on the {fleet} with over {hours:,} flight hours across intercontinental routes.",
            "Experienced {fleet} Fleet Captain and Type Rating Instructor (TRI) with {years} years of line flying.",
            "Long-haul airline captain operating {fleet} aircraft, with extensive command and training background.",
            "Chief Pilot and designated check airman for {fleet} fleet operations under ICAO and civil aviation standards.",
            "Veteran airline captain with {hours:,} hours in commercial air transport, specializing in {fleet} fleet leadership."
        ],
        "mentor_focuses": [
            "Specializing in long-haul oceanic navigation, ETOPS 180 operational planning, and high-altitude weather avoidance.",
            "Dedicated to line-oriented flight training (LOFT), simulator evaluations, and standard operating procedures (SOPs).",
            "Expert in cockpit resource management (CRM), high-stress decision making, and threat & error management (TEM).",
            "Focusing on CAT III low-visibility autoland procedures, performance-based navigation (PBN), and RNAV approaches.",
            "Specializing in command upgrade preparation, standard instrument departures (SIDs), and international airway navigation."
        ],
        "mentor_outlooks": [
            "Passionate about mentoring junior first officers through command upgrade pathways and simulator preparation.",
            "Eager to guide cadet pilots transitioning from turboprops to modern glass-cockpit transport category jets.",
            "Committed to fostering professional airmanship, situational awareness, and safety culture in young aviators.",
            "Offering hands-on mentorship on airline interview preparation, fleet conversion exams, and line check success."
        ],
        "mentee_templates": [
            "Commercial First Officer with {hours} hours on regional equipment preparing for {fleet} line conversion. Seeking guidance on simulator profiles and command upgrade requirements.",
            "Recently graduated commercial pilot holding ATPL frozen and Multi-Crew Cooperation (MCC). Looking for an experienced captain for oceanic flight planning and jet transition mentorship.",
            "Second Officer flying {fleet} equipment ({hours} hours). Keen to master cockpit automation, FMC database programming, and long-range cruise management.",
            "Cadet pilot completing instrument rating and multi-engine turbine qualification. Seeking mentorship from wide-body captains on airline selection and fleet conversion."
        ]
    },
    "Technical and Maintenance Engineering": {
        "mentor_roles": ["Licensed Aircraft Maintenance Engineer (LAME)", "Avionics Specialist", "Quality Assurance Inspector", "Powerplant Systems Lead", "Airframe & Powerplant Specialist"],
        "mentee_roles": ["Apprentice Aircraft Technician", "Junior Maintenance Engineer", "Graduate Avionics Trainee", "Structural Repair Assistant", "Line Maintenance Trainee"],
        "certifications": ["KCAA Part 66 License", "EASA B1.1", "EASA B2", "Turbine Engine Overhaul", "NDT Level II", "FAA A&P License"],
        "fleets": ["Boeing B787 / GEnx-1B", "Boeing B737 NG / CFM56", "Airbus A320 / LEAP-1A", "Airbus A350 / Trent XWB", "Embraer E190 / CF34"],
        "mentor_intros": [
            "Lead Aircraft Maintenance Engineer with {years} years overseeing line and base maintenance on {fleet} equipment.",
            "Senior Licensed Avionics Specialist (EASA B2) with {years} years servicing modern commercial flight decks and electrical buses.",
            "Powerplant Systems Lead with over {years} years dedicated to high-bypass turbofan inspection and overhaul for {fleet}.",
            "Aviation Quality Assurance Inspector holding KCAA Part 66 and EASA B1.1 credentials, managing fleet airworthiness.",
            "Structural Repair Lead Engineer specializing in composite airframe defect rectification and heavy C-check overhauls."
        ],
        "mentor_focuses": [
            "Expert in digital flight control computers, primary flight display arrays, and TCAS II collision avoidance troubleshooting.",
            "Specialized in full-authority digital engine control (FADEC), borescope inspections, and gas-path vibration diagnostics.",
            "Deep background in non-destructive testing (NDT), structural composite repair, and airworthiness directives compliance.",
            "Focusing on aircraft hydraulic line routing, flight control surface rigging, and landing gear retraction system overhauls.",
            "Specializing in maintenance documentation audits, safety management systems (SMS), and ICAO Annex 8 compliance."
        ],
        "mentor_outlooks": [
            "Passionate about mentoring apprentice engineers toward their Part 66 category licenses and line clearance certifications.",
            "Committed to teaching structured avionics fault-tree troubleshooting and digital bus diagnostic methodologies.",
            "Dedicated to guiding junior maintenance technicians through practical powerplant teardowns and defect rectification."
        ],
        "mentee_templates": [
            "Graduate avionics engineering trainee seeking practical knowledge in digital flight instrument troubleshooting and pitot-static calibrations.",
            "Apprentice aircraft technician working toward KCAA Part 66 certification. Seeking mentorship in gas turbine powerplant teardown and defect logging.",
            "Junior maintenance technician assisting in scheduled heavy maintenance checks. Seeking guidance on hydraulic line repairs and structural skin riveting.",
            "Line maintenance assistant eager to learn practical aircraft turn-around servicing and MEL dispatch procedures from licensed LAMEs."
        ]
    },
    "Corporate and Airline Operations": {
        "mentor_roles": ["Flight Operations Dispatch Lead", "Crew Scheduling Manager", "Network Planning Specialist", "Airline Safety Manager", "Operations Control Center (OCC) Director"],
        "mentee_roles": ["Assistant Flight Dispatcher", "Junior Crew Scheduler", "Revenue Management Analyst", "Flight Operations Intern", "Safety Officer Trainee"],
        "certifications": ["Flight Operations Officer (FOO) License", "IATA Dangerous Goods Regulations", "Safety Management Systems (SMS)", "FAA Aircraft Dispatcher"],
        "fleets": ["International Long-Haul Network", "Regional Turboprop Fleet", "Domestic High-Density Routes", "Global Cargo Operations"],
        "mentor_intros": [
            "Senior Flight Operations Dispatch Lead with {years} years orchestrating global flight releases in airline OCC environments.",
            "Crew Resources and Scheduling Superintendent with {years} years managing cockpit and cabin pairings for a {fleet}.",
            "Aviation Safety Management Systems (SMS) Director with {years} years heading flight data monitoring (FDM) and risk analysis.",
            "Network Planning and Fleet Utilization Specialist with extensive airline schedule optimization and route analysis experience."
        ],
        "mentor_focuses": [
            "Specializing in tactical weather rerouting, oceanic NAT HLA navigation, and payload-range fuel optimization under ICAO Annex 6.",
            "Expert in crew flight-time limitations (FTL), irregular operations (IROPS) recovery, and algorithmic pairing optimization.",
            "Specializing in voluntary safety hazard reporting, incident root-cause investigation, and IATA operational safety audits (IOSA).",
            "Focusing on airport slot allocation, bilateral air service agreements (BASA), and network profitability forecasting."
        ],
        "mentor_outlooks": [
            "Passionate about coaching trainee dispatchers through complex weather briefings, alternate airport selection, and fuel contingency.",
            "Eager to guide junior crew coordinators through crew duty regulations and dynamic schedule disruption management.",
            "Dedicated to training young aviation professionals in proactive safety risk assessments and hazard mitigation strategies."
        ],
        "mentee_templates": [
            "Junior flight operations officer trainee seeking mentorship on international flight plan calculation, dynamic weather avoidance, and ETOPS dispatch.",
            "Crew scheduling assistant looking for guidance in algorithmic crew rostering, duty rest compliance, and disruption recovery.",
            "Airline operations graduate intern focused on network revenue analytics, schedule reliability improvements, and airport slot management.",
            "Safety officer trainee eager to learn practical Flight Data Analysis (FDA) procedures and incident hazard logging from veteran safety managers."
        ]
    }
}

def generate_diverse_dataset(total_records=498):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(base_dir, "..", "data", "synthetic_profiles.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    profiles = []
    records_per_dept = total_records // len(DEPARTMENTS)
    used_names = set()

    for dept, data in DEPARTMENTS.items():
        for i in range(records_per_dept):
            is_mentor = (i % 2 == 0)
            role_type = "mentor" if is_mentor else "mentee"

            # Generate realistic unique name
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            full_name = f"{first} {last}"
            if full_name in used_names:
                full_name = f"{first} {last} {chr(65 + (i % 26))}"
            used_names.add(full_name)

            if is_mentor and dept == "Flight Operations":
                display_name = f"Capt. {full_name}"
            elif is_mentor and dept == "Technical and Maintenance Engineering":
                display_name = f"Eng. {full_name}"
            else:
                display_name = full_name

            job_title = random.choice(data["mentor_roles"] if is_mentor else data["mentee_roles"])
            years_exp = random.randint(8, 26) if is_mentor else random.randint(1, 5)
            fleet = random.choice(data["fleets"])
            flight_hours = random.randint(6500, 19500) if is_mentor else random.randint(400, 2200)

            # Generate procedural, rich bio
            if is_mentor:
                intro = random.choice(data["mentor_intros"]).format(fleet=fleet, hours=flight_hours, years=years_exp)
                focus = random.choice(data["mentor_focuses"])
                outlook = random.choice(data["mentor_outlooks"])
                bio = f"{intro} {focus} {outlook}"
            else:
                bio = random.choice(data["mentee_templates"]).format(fleet=fleet, hours=flight_hours, years=years_exp)

            # Pick 2-3 distinct certifications
            certs_sample = random.sample(data["certifications"], k=min(3, len(data["certifications"])))

            profile = {
                "profile_id": str(uuid.uuid4()),
                "user_id": str(uuid.uuid4()),
                "role": role_type,
                "full_name": display_name,
                "department": dept,
                "job_title": job_title,
                "years_experience": years_exp,
                "certifications": ", ".join(certs_sample),
                "raw_bio": bio
            }
            profiles.append(profile)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(profiles, f, indent=2)

    print(f"Successfully generated {len(profiles)} diverse, realistic aviation profiles -> {output_path}")

if __name__ == "__main__":
    generate_diverse_dataset(498)