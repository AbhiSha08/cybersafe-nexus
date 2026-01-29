import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings
import uuid
from datetime import datetime, timezone

# --- FULL UNABRIDGED CURRICULUM DATA ---
curriculum_data = [
    {
        "id": "mod_1",
        "title": "Module 1: Foundations",
        "category": "Foundations",
        "tier": "beginner",
        "xp": 100,
        "image": "/assets/images/cia_triad.png",
        "topics": ["CIA Triad", "Digital Hygiene", "Privilege"],
        "content": """
        <div class="space-y-6 text-slate-300 leading-relaxed">
            <h3 class="text-xl font-bold text-cyan-400 mt-4">1.1 Introduction: What is Cybersecurity?</h3>
            <p>Cybersecurity refers to the body of technologies, processes, and practices designed to protect networks, devices, programs, and data from attack, damage, or unauthorized access. It is not merely a technical issue but a societal one, as our dependence on computer systems for essential services like finance, power, and communication continues to grow. Ultimately, its goal is to preserve the reliability and safety of the digital infrastructure that underpins modern life.</p>
            
            <h3 class="text-xl font-bold text-cyan-400 mt-4">1.2 The Core Mission: The CIA Triad</h3>
            <p>A disciplined approach to security relies on the Confidentiality, Integrity, and Availability framework, known as the CIA Triad:</p>
            
            <div class="my-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <img src="/assets/images/cia_triad.png" alt="CIA Triad Diagram" class="w-full max-w-lg mx-auto rounded-lg shadow-lg" />
            </div>

            <ul class="list-disc pl-5 space-y-2">
                <li><strong>Confidentiality:</strong> This ensures that sensitive information is accessible only to those authorized to view it. Measures like encryption and access control lists (ACLs) are used here. For example, a hospital patient's records should be visible to their doctor, but not to the hospital's billing clerk.</li>
                <li><strong>Integrity:</strong> This guarantees that data has not been altered or tampered with by unauthorized people. If a hacker changes a financial transaction from $100 to $100,000, they have violated the integrity of the system. We use hashing and digital signatures to verify integrity.</li>
                <li><strong>Availability:</strong> Information must be accessible when needed. If a system is taken offline by a Denial-of-Service (DoS) attack, it fails this pillar. Backups and redundant power supplies protect availability.</li>
            </ul>

            <h3 class="text-xl font-bold text-cyan-400 mt-4">1.3 Digital Hygiene</h3>
            <p>Just as personal hygiene prevents illness, digital hygiene prevents cyber incidents. It relies on routine discipline rather than just expensive software.</p>
            <p><strong>Core Practices:</strong></p>
            <ol class="list-decimal pl-5 space-y-2">
                <li><strong>Updates:</strong> Keeping software patched to fix known vulnerabilities.</li>
                <li><strong>Backups:</strong> Storing copies of data in a separate location (like the cloud) to recover from ransomware.</li>
                <li><strong>Least Privilege:</strong> Ensuring users only have the access rights they absolutely need to do their jobs (e.g., a standard employee shouldn't have Admin rights).</li>
            </ol>
        </div>
        """
    },
    {
        "id": "mod_2",
        "title": "Module 2: Threat Landscape",
        "category": "Threats",
        "tier": "beginner",
        "xp": 150,
        "image": "/assets/images/attack_vectors.png",
        "topics": ["Malware", "Phishing", "Attack Vectors"],
        "content": """
        <div class="space-y-6 text-slate-300 leading-relaxed">
            <h3 class="text-xl font-bold text-red-400 mt-4">2.1 The Attack Surface</h3>
            <p>The "threat landscape" encompasses every potential entry point (attack vector) an attacker could use. Common vectors include unsecured Wi-Fi (often found in coffee shops), removable media (like infected USB drives left in parking lots), and Cloud Services (where poorly configured permissions can expose entire databases).</p>
            
            <div class="my-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <img src="/assets/images/attack_vectors.png" alt="Attack Vector Map" class="w-full max-w-lg mx-auto rounded-lg shadow-lg" />
            </div>

            <h3 class="text-xl font-bold text-red-400 mt-4">2.2 Malware (Malicious Software)</h3>
            <p>Malware is any code intentionally written to harm a system. It generally has two parts: a Propagation Mechanism (how it spreads) and a Payload (the damage it does).</p>
            
            <div class="my-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <img src="/assets/images/malware_types.png" alt="Malware Comparison" class="w-full max-w-lg mx-auto rounded-lg shadow-lg" />
            </div>

            <ul class="list-disc pl-5 space-y-2">
                <li><strong>Viruses:</strong> Like a biological virus, a computer virus needs a "host" to survive. It attaches itself to a legitimate file (like a Word doc) and requires user action (like opening the file) to activate.</li>
                <li><strong>Worms:</strong> These are deadlier than viruses because they are self-replicating. A worm does not need a human to open a file; it can scan a network, find a vulnerability, and copy itself to other machines automatically.</li>
                <li><strong>Trojans:</strong> Named after the Trojan Horse of Troy, this malware disguises itself as legitimate software (like a free game or antivirus). Once installed, it opens a "backdoor" for hackers to control the system remotely (often called a RAT - Remote Access Trojan).</li>
                <li><strong>Ransomware:</strong> This malware encrypts a victim's files, making them unreadable. The attacker then demands payment (usually in Bitcoin) for the decryption key. Modern ransomware often steals data before encrypting it to threaten public leakage (double extortion).</li>
            </ul>

            <h3 class="text-xl font-bold text-red-400 mt-4">2.3 Network & Web Attacks</h3>
            <ul class="list-disc pl-5 space-y-2">
                <li><strong>Phishing:</strong> A form of social engineering where attackers impersonate trusted entities (like banks or CEOs) to steal credentials. Spear-Phishing is a highly targeted version that uses specific personal details to make the scam convincing.</li>
                <li><strong>Man-in-the-Middle (MITM):</strong> An attacker secretly intercepts communications between two parties. For example, if you use an unsecured public Wi-Fi, an attacker can "sit" between you and the bank's website, reading everything you type.</li>
                <li><strong>SQL Injection (SQLi):</strong> An attack on web databases. Hackers type malicious SQL commands (like ' OR '1'='1) into login forms. If the website doesn't sanitize this input, the database interprets it as a command and may dump all user passwords.</li>
            </ul>
            
            <div class="my-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <img src="/assets/images/phishing_email.png" alt="Phishing Anatomy" class="w-full max-w-lg mx-auto rounded-lg shadow-lg" />
            </div>
        </div>
        """
    },
    {
        "id": "mod_3",
        "title": "Module 3: Defensive Architecture",
        "category": "Defense",
        "tier": "intermediate",
        "xp": 200,
        "image": "/assets/images/mfa_diagram.png",
        "topics": ["Firewalls", "MFA", "Security by Design"],
        "content": """
        <div class="space-y-6 text-slate-300 leading-relaxed">
            <h3 class="text-xl font-bold text-emerald-400 mt-4">3.1 Security by Design</h3>
            <p>Security should not be an afterthought; it must be built into the system from the ground up.</p>
            <ul class="list-disc pl-5 space-y-2">
                <li><strong>Defense in Depth:</strong> Never rely on a single lock. This strategy uses multiple layers of security (e.g., Firewall + Antivirus + MFA). If an attacker breaches the firewall, they still face the antivirus.</li>
                <li><strong>Air Gapping:</strong> For critical systems (like nuclear plants or military grids), the most secure method is physically disconnecting the computer from the internet entirely.</li>
            </ul>

            <h3 class="text-xl font-bold text-emerald-400 mt-4">3.2 Technical Controls</h3>
            <ul class="list-disc pl-5 space-y-2">
                <li><strong>Firewalls:</strong> The gatekeepers of the network. They filter incoming and outgoing traffic based on strict rules. They can be software (running on your PC) or hardware (a physical device protecting an office).</li>
                <li><strong>Multi-Factor Authentication (MFA):</strong> This is the single most effective defense against password theft. It requires:
                    <ol class="list-decimal pl-5 mt-2 space-y-1">
                        <li>Something you Know: (Password)</li>
                        <li>Something you Have: (Phone, USB Key)</li>
                        <li>Something you Are: (Fingerprint, Face ID)</li>
                    </ol>
                    Even if a hacker steals your password, they cannot login without your phone.
                </li>
                <li><strong>Intrusion Detection Systems (IDS):</strong> These monitor networks for suspicious activity or policy violations and alert administrators.</li>
            </ul>
            <div class="my-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <img src="/assets/images/mfa_diagram.png" alt="MFA Process Diagram" class="w-full max-w-lg mx-auto rounded-lg shadow-lg" />
            </div>
        </div>
        """
    },
    {
        "id": "mod_4",
        "title": "Module 4: Cryptography",
        "category": "Cryptography",
        "tier": "intermediate",
        "xp": 250,
        "image": "/assets/images/encryption_process.png",
        "topics": ["Encryption", "Hashing", "Certificates"],
        "content": """
        <div class="space-y-6 text-slate-300 leading-relaxed">
            <h3 class="text-xl font-bold text-violet-400 mt-4">4.1 What is Cryptography?</h3>
            <p>Derived from the Greek "Kryptos" (hidden), cryptography transforms Plaintext (readable data) into Ciphertext (unreadable gibberish) using mathematical algorithms.</p>

            <h3 class="text-xl font-bold text-violet-400 mt-4">4.2 Encryption Types</h3>
            <div class="my-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <img src="/assets/images/encryption_process.png" alt="Asymmetric Encryption" class="w-full max-w-lg mx-auto rounded-lg shadow-lg" />
            </div>
            <ul class="list-disc pl-5 space-y-2">
                <li><strong>Symmetric Encryption:</strong> Uses a single shared key to both lock and unlock the data. It is very fast and efficient for large files (like encrypting a hard drive).
                    <br/><em>The Problem:</em> If you want to send a secure message to a friend, you have to somehow give them the key first without anyone else seeing it.
                </li>
                <li><strong>Asymmetric (Public-Key) Encryption:</strong> Solves the key sharing problem by using two keys:
                    <ol class="list-decimal pl-5 mt-2 space-y-1">
                        <li><strong>Public Key:</strong> You share this with everyone. People use it to encrypt messages to you.</li>
                        <li><strong>Private Key:</strong> You keep this secret. Only this key can decrypt messages sent to your public key.</li>
                    </ol>
                    <em>Analogy:</em> Anyone can drop a letter in your mailbox (Public Key), but only you have the key to open it (Private Key).
                </li>
            </ul>

            <h3 class="text-xl font-bold text-violet-400 mt-4">4.3 Hashing & Digital Signatures</h3>
            <ul class="list-disc pl-5 space-y-2">
                <li><strong>Hashing:</strong> A one-way process that turns data into a unique string of characters (a "fingerprint"). If you change even one comma in a 100-page document, the hash changes completely. This proves Integrity.</li>
                <li><strong>Digital Signatures:</strong> Uses hashing and asymmetric keys to prove who signed a document and that it hasn't changed.</li>
            </ul>

            <h3 class="text-xl font-bold text-violet-400 mt-4">4.4 Digital Certificates</h3>
            <p>These are like digital passports issued by a Certificate Authority (CA). They verify that a website (like google.com) is actually who they say they are. This prevents attackers from creating fake banking sites and is the technology behind the "padlock" icon in web browsers.</p>
            <div class="my-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <img src="/assets/images/browser_cert.png" alt="Browser Certificate" class="w-full max-w-md mx-auto rounded-lg shadow-lg" />
            </div>
        </div>
        """
    },
    {
        "id": "mod_5",
        "title": "Module 5: Operational Security",
        "category": "RealWorld",
        "tier": "advanced",
        "xp": 300,
        "image": "/assets/images/incident_response.png",
        "topics": ["IoT Risks", "Incident Response", "Critical Infra"],
        "content": """
        <div class="space-y-6 text-slate-300 leading-relaxed">
            <h3 class="text-xl font-bold text-amber-400 mt-4">5.1 Vulnerable Sectors: The "Cyber-Kinetic" Threat</h3>
            <p>As we connect physical objects to the internet, we face a new type of threat: Cyber-Kinetic Attacks. These are digital attacks that cause physical damage or injury.</p>
            <ul class="list-disc pl-5 space-y-2">
                <li><strong>The Internet of Things (IoT):</strong>
                    <ul class="list-circle pl-5 mt-1 space-y-1">
                        <li>The Risk: Everyday objects like door locks, thermostats, and cameras often lack strong security. If a "smart lock" is connected to the internet, a hacker could physically unlock a home from miles away.</li>
                        <li>The Impact: Unlike a credit card theft, these attacks affect personal safety. The sheer number of unsecured devices creates a massive "attack surface" for criminals.</li>
                    </ul>
                </li>
                <li><strong>Automotive Security:</strong>
                    <ul class="list-circle pl-5 mt-1 space-y-1">
                        <li>The Risk: Modern cars are essentially computers on wheels, controlling everything from engine timing to braking. They connect via Wi-Fi, Bluetooth, and cellular networks.</li>
                        <li>Case Study: In a famous 2015 test, researchers remotely hacked a Jeep Cherokee from 10 miles away. They were able to cut the transmission and drive the vehicle into a ditch.</li>
                    </ul>
                </li>
                <li><strong>Healthcare Systems:</strong>
                    <ul class="list-circle pl-5 mt-1 space-y-1">
                        <li>The Risk: Medical devices like pacemakers and insulin pumps are increasingly wireless. Researchers have demonstrated vulnerabilities that could theoretically allow attackers to deliver lethal doses of medication or stop a heart.</li>
                        <li>Hospital Targets: Hospitals are frequent targets for ransomware because they cannot afford downtime. Attacks can lock access to patient records, delaying critical surgeries.</li>
                    </ul>
                </li>
            </ul>

            <h3 class="text-xl font-bold text-amber-400 mt-4">5.2 Critical Infrastructure & Finance</h3>
            <ul class="list-disc pl-5 space-y-2">
                <li><strong>The Energy Sector:</strong> Power grids and nuclear plants rely on SCADA (Supervisory Control and Data Acquisition) systems. An attack here could cause blackouts indistinguishable from natural disasters.
                <br/>Distributed Energy: As homes generate their own solar power and feed it back to the grid, the number of entry points for attackers increases.</li>
                <li><strong>Financial Systems:</strong> Banks and stock exchanges are high-value targets. Attackers don't just steal money; they can manipulate markets or disrupt the entire economy.
                <br/>ATMs: Criminals have physically tampered with ATMs to install "skimmers" or hacked their software to force them to dispense cash (a technique called "Jackpotting").</li>
            </ul>

            <h3 class="text-xl font-bold text-amber-400 mt-4">5.3 Incident Management: What Happens When You're Hacked?</h3>
            <p>When prevention fails, organizations rely on Incident Management. It is not a chaotic reaction; it is a structured, four-step lifecycle:</p>
            <div class="my-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <img src="/assets/images/incident_response.png" alt="Incident Response Cycle" class="w-full max-w-lg mx-auto rounded-lg shadow-lg" />
            </div>
            <ol class="list-decimal pl-5 space-y-2">
                <li><strong>Preparation:</strong> This happens before the attack. It involves training staff, creating a "Response Plan," and ensuring tools are in place to detect breaches.</li>
                <li><strong>Detection & Analysis:</strong> The team identifies suspicious activity (from logs or alerts) and confirms if it is a real incident. They must determine the scope: How many systems are infected?.</li>
                <li><strong>Containment, Eradication & Recovery:</strong>
                    <ul class="list-circle pl-5 mt-1 space-y-1">
                        <li>Containment: Stop the bleeding. Isolate infected computers from the network so the malware doesn't spread.</li>
                        <li>Eradication: Remove the malware and kick out the attackers (e.g., delete malicious files, reset passwords).</li>
                        <li>Recovery: Restore data from backups and bring systems back online carefully.</li>
                    </ul>
                </li>
                <li><strong>Post-Incident Activity:</strong> A "Post-Mortem" analysis. The team asks: "How did they get in?" and "What do we need to fix so this never happens again?".</li>
            </ol>
        </div>
        """
    },
    {
        "id": "mod_6",
        "title": "Module 6: Declassified Case Files",
        "category": "CaseStudies",
        "tier": "advanced",
        "xp": 350,
        "image": "/assets/images/stuxnet.png", 
        "topics": ["Stuxnet", "Morris Worm", "Colonial Pipeline", "Target", "I Love You"],
        "content": """
        <div class="space-y-6 text-slate-300 leading-relaxed">
            <h3 class="text-xl font-bold text-rose-400 mt-4">Case File 01: The Morris Worm (1988)</h3>
            <ul class="list-disc pl-5 space-y-1">
                <li><strong>The Incident:</strong> The first major internet worm, written by a Cornell student, Robert Morris.</li>
                <li><strong>The Technique:</strong> It exploited vulnerabilities in UNIX commands (finger and sendmail) to copy itself from machine to machine.</li>
                <li><strong>The Impact:</strong> It infected 10% of the entire internet (about 6,000 computers at the time), slowing them down to a crawl.</li>
                <li><strong>The Lesson:</strong> It was the "wake-up call" that led to the creation of the first Computer Emergency Response Teams (CERTs).</li>
            </ul>

            <h3 class="text-xl font-bold text-rose-400 mt-4">Case File 02: Stuxnet (2010)</h3>
            <ul class="list-disc pl-5 space-y-1">
                <li><strong>The Target:</strong> Iran’s Natanz nuclear enrichment facility.</li>
                <li><strong>The Weapon:</strong> A highly sophisticated military-grade worm, believed to be created by the US and Israel.</li>
                <li><strong>The Technique:</strong> It jumped the "air gap" via an infected USB drive. It targeted specific Siemens industrial controllers (PLCs) and made the centrifuges spin too fast until they tore themselves apart, all while sending fake "everything is fine" data to the monitors.</li>
                <li><strong>The Impact:</strong> It physically destroyed nearly 1,000 nuclear centrifuges, setting back Iran's nuclear program by years. It was the first proof of a Cyber-Kinetic Weapon.</li>
            </ul>

            <h3 class="text-xl font-bold text-rose-400 mt-4">Case File 03: The Target Breach (2013)</h3>
            <ul class="list-disc pl-5 space-y-1">
                <li><strong>The Incident:</strong> 40 million credit card numbers were stolen from the retail giant Target.</li>
                <li><strong>The Technique:</strong> The hackers didn't attack Target directly. They hacked a small third-party HVAC (Air Conditioning) vendor that had access to Target's network. They used this foothold to move laterally to the Point-of-Sale (POS) registers.</li>
                <li><strong>The Lesson:</strong> Supply Chain Risk. Your security is only as strong as your weakest vendor.</li>
            </ul>

            <h3 class="text-xl font-bold text-rose-400 mt-4">Case File 04: Colonial Pipeline (2021)</h3>
            <ul class="list-disc pl-5 space-y-1">
                <li><strong>The Incident:</strong> A ransomware attack shut down the largest fuel pipeline in the US.</li>
                <li><strong>The Technique:</strong> Hackers compromised a single legacy VPN account that did not have Multi-Factor Authentication (MFA) enabled.</li>
                <li><strong>The Impact:</strong> Panic buying led to gas shortages across the US East Coast. Ideally, the pipeline itself wasn't infected, but the company shut it down as a precaution because their billing system was compromised.</li>
                <li><strong>The Lesson:</strong> The critical need for MFA on all remote access points.</li>
            </ul>

            <h3 class="text-xl font-bold text-rose-400 mt-4">Case File 05: The "I Love You" Virus (2000)</h3>
            <ul class="list-disc pl-5 space-y-1">
                <li><strong>The Incident:</strong> An email worm that infected millions of Windows PCs.</li>
                <li><strong>The Technique:</strong> Social Engineering. The email subject line was "ILOVEYOU" with an attachment named LOVE-LETTER-FOR-YOU.TXT.vbs. The double extension tricked users into thinking it was a text file, but it was actually a Visual Basic script.</li>
                <li><strong>The Impact:</strong> It caused billions of dollars in damage by overwriting files and emailing itself to everyone in the victim's address book.</li>
                <li><strong>The Lesson:</strong> Never trust file extensions; user awareness is critical.</li>
            </ul>
        </div>
        """
    },
    {
        "id": "mod_7",
        "title": "Module 7: History & Career",
        "category": "Career",
        "tier": "beginner",
        "xp": 100,
        "image": "/assets/images/career_path.png",
        "topics": ["Hacking History", "Career Paths", "Roles"],
        "content": """
        <div class="space-y-6 text-slate-300 leading-relaxed">
            <h3 class="text-xl font-bold text-cyan-400 mt-4">7.1 A Brief History of Hacking</h3>
            <p>Cybersecurity is not new; it has evolved alongside computing for over 60 years.</p>
            <ul class="list-disc pl-5 space-y-2">
                <li><strong>The Early Years (1970s-80s):</strong>
                    <ul class="list-circle pl-5 mt-1">
                        <li>Creeper (1971): One of the first computer worms. It was experimental and simply displayed the message: "I'M THE CREEPER: CATCH ME IF YOU CAN".</li>
                    </ul>
                </li>
                <li><strong>The Espionage Era (1990s-2000s):</strong>
                    <ul class="list-circle pl-5 mt-1">
                        <li>The Cuckoo's Egg (1986): A German hacker named Markus Hess hacked into US military networks and sold the data to the Soviet KGB. This was the first documented case of cyber espionage.</li>
                    </ul>
                </li>
                <li><strong>Modern Cyberwarfare (2010-Present):</strong> Hacking has shifted from "curiosity" to "profit" and "warfare," with organized groups using DDoS attacks and botnets for extortion and nation-states targeting critical infrastructure.</li>
            </ul>

            <h3 class="text-xl font-bold text-cyan-400 mt-4">7.2 Career Pathways in Cybersecurity</h3>
            <p>The field has a "problematic shortage" of skilled workers, making it a high-demand career.</p>
            <div class="my-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <img src="/assets/images/career_path.png" alt="Cybersecurity Career Paths" class="w-full max-w-lg mx-auto rounded-lg shadow-lg" />
            </div>
            <ul class="list-disc pl-5 space-y-2">
                <li><strong>Security Analyst:</strong> The "detective." They monitor networks for suspicious activity, analyze vulnerabilities, and recommend solutions.</li>
                <li><strong>Security Engineer:</strong> The "builder." They design and implement security systems (like firewalls and IDS) to protect the infrastructure.</li>
                <li><strong>Security Architect:</strong> The "planner." A senior role that designs the overall security structure of an organization, ensuring it meets business and legal needs.</li>
                <li><strong>CISO (Chief Information Security Officer):</strong> The "executive." A high-level management role responsible for the entire organization's security strategy and staff.</li>
                <li><strong>Ethical Hacker (Penetration Tester):</strong> They are paid to legally hack into systems to find weak points before the bad guys do.</li>
            </ul>
        </div>
        """
    },
    {
        "id": "mod_8",
        "title": "Module 8: Summary",
        "category": "Summary",
        "tier": "all",
        "xp": 500,
        "image": "/assets/images/cia_triad.png", 
        "topics": ["Review", "Resilience", "Next Steps"],
        "content": """
        <div class="space-y-6 text-slate-300 leading-relaxed">
            <h3 class="text-xl font-bold text-slate-200 mt-4">8.1 Mission Debrief</h3>
            <p>Cybersecurity is the essential practice of defending our digital way of life. By understanding the <strong>CIA Triad</strong> (Module 1), recognizing the diverse <strong>Threat Landscape</strong> (Module 2), and implementing robust <strong>Defensive Architectures</strong> (Module 3) and <strong>Cryptography</strong> (Module 4), we build resilience.</p>
            
            <p>Real-world applications in <strong>Operational Security</strong> (Module 5) and lessons from historical <strong>Case Studies</strong> (Module 6) demonstrate that security is not a static goal but a continuous process of adaptation against an evolving adversary.</p>
            
            <div class="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mt-8">
                <p class="text-emerald-400 font-bold text-lg text-center">
                    Congratulations, Operative.
                </p>
                <p class="text-emerald-300/80 text-center mt-2">
                    Now that you have completed all the modules, you should be able to analyze and mitigate complex cyber threats, implement secure defensive architectures, and confidently navigate the modern cybersecurity landscape with a professional understanding of risk and resilience.
                </p>
            </div>
        </div>
        """
    }
]

async def seed_data():
    print("🌱 Connecting to Database...")
    
    # 1. CONNECT USING YOUR CONFIG SETTINGS
    client = AsyncIOMotorClient(settings.MONGO_URL) 
    db = client[settings.DB_NAME]
    
    print("🧹 Cleaning old curriculum...")
    await db.lessons.delete_many({})
    
    print(f"🚀 Inserting {len(curriculum_data)} modules...")
    
    for lesson in curriculum_data:
        # Keep specific IDs, add timestamps
        lesson["created_at"] = datetime.now(timezone.utc)
        lesson["quiz"] = [] # AI generates this later
        
    await db.lessons.insert_many(curriculum_data)
    
    print("✅ SUCCESS! Comprehensive Curriculum Loaded.")
    client.close()

if __name__ == "__main__":
    try:
        asyncio.run(seed_data())
    except RuntimeError:
        loop = asyncio.get_event_loop()
        loop.run_until_complete(seed_data())