import type {
  Announcement,
  CampusEvent,
  Community,
  CommunityMembership,
  DemoDatabase,
  EventRegistration,
  UserProfile,
} from '@/types'

const avatar = (name: string, color = '1f75f0') =>
  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=${color}&fontFamily=Arial`

const fromNow = (days: number, hour = 17, minute = 0) => {
  const value = new Date()
  value.setDate(value.getDate() + days)
  value.setHours(hour, minute, 0, 0)
  return value.toISOString()
}

const ago = (days: number, hour = 10) => fromNow(-days, hour)

const studentProfiles: Array<Pick<UserProfile, 'fullName' | 'email' | 'department' | 'academicYear' | 'interests' | 'skills'>> = [
  { fullName: 'Aisha Khan', email: 'aisha.khan@campus.edu', department: 'Computer Science', academicYear: 'Year 3', interests: ['Cloud computing', 'AI'], skills: ['TypeScript', 'AWS', 'React'] },
  { fullName: 'Omar Farooq', email: 'omar.farooq@campus.edu', department: 'Electrical Engineering', academicYear: 'Year 2', interests: ['Robotics', 'IoT'], skills: ['Python', 'Arduino', 'CAD'] },
  { fullName: 'Sara Ahmed', email: 'sara.ahmed@campus.edu', department: 'Business Administration', academicYear: 'Year 3', interests: ['Startups', 'Marketing'], skills: ['Strategy', 'Figma', 'Public speaking'] },
  { fullName: 'Daniel Kim', email: 'daniel.kim@campus.edu', department: 'Software Engineering', academicYear: 'Year 4', interests: ['Open source', 'Cloud'], skills: ['Java', 'Kotlin', 'Docker'] },
  { fullName: 'Maya Patel', email: 'maya.patel@campus.edu', department: 'Data Science', academicYear: 'Year 2', interests: ['Machine learning', 'Research'], skills: ['Python', 'SQL', 'Pandas'] },
  { fullName: 'Liam Chen', email: 'liam.chen@campus.edu', department: 'Mechanical Engineering', academicYear: 'Year 3', interests: ['Robotics', 'Sustainability'], skills: ['SolidWorks', 'MATLAB', 'Fabrication'] },
  { fullName: 'Noor Hassan', email: 'noor.hassan@campus.edu', department: 'Cybersecurity', academicYear: 'Year 1', interests: ['Security', 'CTFs'], skills: ['Linux', 'Networking', 'Python'] },
  { fullName: 'Ethan Brooks', email: 'ethan.brooks@campus.edu', department: 'Computer Science', academicYear: 'Year 2', interests: ['Web development', 'Hackathons'], skills: ['JavaScript', 'Node.js', 'Git'] },
  { fullName: 'Zara Ali', email: 'zara.ali@campus.edu', department: 'Media Studies', academicYear: 'Year 4', interests: ['Film', 'Culture'], skills: ['Editing', 'Photography', 'Storytelling'] },
  { fullName: 'Mateo Garcia', email: 'mateo.garcia@campus.edu', department: 'Business Administration', academicYear: 'Year 3', interests: ['Entrepreneurship', 'Fintech'], skills: ['Finance', 'Pitching', 'Excel'] },
  { fullName: 'Sophia Nguyen', email: 'sophia.nguyen@campus.edu', department: 'Bioinformatics', academicYear: 'Year 2', interests: ['Health tech', 'Data'], skills: ['R', 'Python', 'Research'] },
  { fullName: 'Ibrahim Malik', email: 'ibrahim.malik@campus.edu', department: 'Computer Engineering', academicYear: 'Year 3', interests: ['Embedded systems', 'Cloud'], skills: ['C++', 'AWS', 'Rust'] },
  { fullName: 'Emma Wilson', email: 'emma.wilson@campus.edu', department: 'Interaction Design', academicYear: 'Year 1', interests: ['UX', 'Accessibility'], skills: ['Figma', 'Illustrator', 'Research'] },
  { fullName: 'Arjun Rao', email: 'arjun.rao@campus.edu', department: 'Artificial Intelligence', academicYear: 'Year 4', interests: ['Generative AI', 'MLOps'], skills: ['PyTorch', 'Python', 'AWS'] },
  { fullName: 'Layla Rahman', email: 'layla.rahman@campus.edu', department: 'Economics', academicYear: 'Year 2', interests: ['Social impact', 'Policy'], skills: ['Analysis', 'R', 'Writing'] },
  { fullName: 'Lucas Martin', email: 'lucas.martin@campus.edu', department: 'Robotics Engineering', academicYear: 'Year 3', interests: ['Autonomy', 'Competitions'], skills: ['ROS', 'C++', '3D printing'] },
  { fullName: 'Hana Suzuki', email: 'hana.suzuki@campus.edu', department: 'Information Systems', academicYear: 'Year 2', interests: ['Product management', 'Cloud'], skills: ['SQL', 'Scrum', 'Tableau'] },
  { fullName: 'Yusuf Saleem', email: 'yusuf.saleem@campus.edu', department: 'Software Engineering', academicYear: 'Year 1', interests: ['Mobile apps', 'Community'], skills: ['Flutter', 'Git', 'Firebase'] },
  { fullName: 'Olivia Brown', email: 'olivia.brown@campus.edu', department: 'Psychology', academicYear: 'Year 4', interests: ['Wellbeing', 'Leadership'], skills: ['Research', 'Facilitation', 'SPSS'] },
  { fullName: 'Rayan Chowdhury', email: 'rayan.chowdhury@campus.edu', department: 'Computer Science', academicYear: 'Year 3', interests: ['Competitive programming', 'AI'], skills: ['C++', 'Algorithms', 'Python'] },
]

function createUsers(): UserProfile[] {
  const students: UserProfile[] = studentProfiles.map((profile, index) => ({
    id: `student-${String(index + 1).padStart(2, '0')}`,
    ...profile,
    role: 'student',
    status: 'active',
    avatarUrl: avatar(profile.fullName, index % 3 === 0 ? 'dbeafe' : index % 3 === 1 ? 'e0e7ff' : 'd1fae5'),
    bio: index === 0
      ? 'Cloud builder, peer mentor, and lifelong learner. I enjoy turning campus ideas into useful products.'
      : `${profile.department} student interested in ${profile.interests.join(' and ').toLowerCase()}.`,
    managedCommunityIds: [],
    createdAt: ago(120 - index),
    isDemo: true,
  }))

  return [
    ...students,
    {
      id: 'organizer-cloud',
      email: 'cloudclub@campus.edu',
      fullName: 'Nadia Rahman',
      role: 'organizer',
      status: 'active',
      avatarUrl: avatar('Nadia Rahman', 'bfdbfe'),
      department: 'School of Computing',
      academicYear: 'Society Organizer',
      bio: 'AWS Cloud Club captain and community builder.',
      interests: ['Cloud computing', 'Community'],
      skills: ['AWS', 'Event planning', 'Mentoring'],
      managedCommunityIds: ['community-aws', 'community-cyber'],
      createdAt: ago(240),
      isDemo: true,
    },
    {
      id: 'organizer-innovation',
      email: 'innovation@campus.edu',
      fullName: 'Marcus Reed',
      role: 'organizer',
      status: 'active',
      avatarUrl: avatar('Marcus Reed', 'c7d2fe'),
      department: 'Innovation Centre',
      academicYear: 'Society Organizer',
      bio: 'Helping student teams move from first sketch to working prototype.',
      interests: ['Entrepreneurship', 'Robotics'],
      skills: ['Product', 'Fundraising', 'Hardware'],
      managedCommunityIds: ['community-robotics', 'community-entrepreneurship'],
      createdAt: ago(220),
      isDemo: true,
    },
    {
      id: 'organizer-tech',
      email: 'techsocieties@campus.edu',
      fullName: 'Priya Desai',
      role: 'organizer',
      status: 'active',
      avatarUrl: avatar('Priya Desai', 'ddd6fe'),
      department: 'Student Technology Office',
      academicYear: 'Society Organizer',
      bio: 'Developer community lead focused on practical learning.',
      interests: ['Developer tools', 'AI'],
      skills: ['Community operations', 'Python', 'Workshops'],
      managedCommunityIds: ['community-gdsc', 'community-ai'],
      createdAt: ago(210),
      isDemo: true,
    },
    {
      id: 'admin-01',
      email: 'admin@campus.edu',
      fullName: 'Dr. Elaine Carter',
      role: 'admin',
      status: 'active',
      avatarUrl: avatar('Elaine Carter', 'bfdbfe'),
      department: 'Student Affairs',
      academicYear: 'Platform Administrator',
      bio: 'CampusConnect platform administrator.',
      interests: ['Student success', 'Digital campus'],
      skills: ['Operations', 'Governance'],
      managedCommunityIds: [],
      createdAt: ago(365),
      isDemo: true,
    },
  ]
}

function createCommunities(): Community[] {
  return [
    {
      id: 'community-aws',
      name: 'AWS Cloud Club',
      slug: 'aws-cloud-club',
      shortDescription: 'Build practical cloud skills with peers and AWS community leaders.',
      description: 'A hands-on community for students exploring cloud architecture, serverless computing, DevOps, and careers in the AWS ecosystem. We run build nights, certification circles, and speaker sessions.',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      category: 'Cloud & DevOps',
      leaderIds: ['organizer-cloud'],
      leaderNames: ['Nadia Rahman'],
      memberCount: 0,
      status: 'approved',
      featured: true,
      createdAt: ago(260),
    },
    {
      id: 'community-gdsc',
      name: 'Google Developer Student Club',
      slug: 'google-developer-student-club',
      shortDescription: 'Learn, build, and solve local problems with developer technology.',
      description: 'A welcoming developer community that connects students across disciplines through study jams, product sprints, and collaborative projects with social impact.',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      category: 'Software Development',
      leaderIds: ['organizer-tech'],
      leaderNames: ['Priya Desai'],
      memberCount: 0,
      status: 'approved',
      featured: true,
      createdAt: ago(250),
    },
    {
      id: 'community-ai',
      name: 'AI and Machine Learning Society',
      slug: 'ai-machine-learning-society',
      shortDescription: 'Explore responsible AI through research, projects, and peer learning.',
      description: 'Students from every major can learn the foundations of machine learning, discuss responsible AI, join reading groups, and ship portfolio projects with experienced mentors.',
      imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
      category: 'Artificial Intelligence',
      leaderIds: ['organizer-tech'],
      leaderNames: ['Priya Desai'],
      memberCount: 0,
      status: 'approved',
      featured: true,
      createdAt: ago(230),
    },
    {
      id: 'community-robotics',
      name: 'Robotics Society',
      slug: 'robotics-society',
      shortDescription: 'Design, fabricate, and program robots for real-world challenges.',
      description: 'Our multidisciplinary teams work on autonomous vehicles, robotic arms, and competition builds. Beginners are supported through practical electronics and fabrication sessions.',
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
      category: 'Engineering',
      leaderIds: ['organizer-innovation'],
      leaderNames: ['Marcus Reed'],
      memberCount: 0,
      status: 'approved',
      featured: false,
      createdAt: ago(225),
    },
    {
      id: 'community-cyber',
      name: 'Cybersecurity Society',
      slug: 'cybersecurity-society',
      shortDescription: 'Practice ethical security skills in a safe, collaborative environment.',
      description: 'Weekly labs cover defensive security, threat modeling, digital forensics, and capture-the-flag challenges. All activity follows our ethical practice policy.',
      imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
      category: 'Cybersecurity',
      leaderIds: ['organizer-cloud'],
      leaderNames: ['Nadia Rahman'],
      memberCount: 0,
      status: 'approved',
      featured: false,
      createdAt: ago(215),
    },
    {
      id: 'community-entrepreneurship',
      name: 'Entrepreneurship Society',
      slug: 'entrepreneurship-society',
      shortDescription: 'Find co-founders, test ideas, and learn from working entrepreneurs.',
      description: 'From idea validation to pitch practice, we give student founders a place to experiment. Members meet alumni founders, investors, and peers building their first ventures.',
      imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80',
      category: 'Entrepreneurship',
      leaderIds: ['organizer-innovation'],
      leaderNames: ['Marcus Reed'],
      memberCount: 0,
      status: 'approved',
      featured: true,
      createdAt: ago(205),
    },
    {
      id: 'community-green-campus',
      name: 'Green Campus Collective',
      slug: 'green-campus-collective',
      shortDescription: 'Student-led projects for a lower-impact, more resilient campus.',
      description: 'A proposed society connecting students around biodiversity, circular design, climate literacy, and practical sustainability projects across university grounds.',
      imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80',
      category: 'Sustainability',
      leaderIds: ['student-15'],
      leaderNames: ['Layla Rahman'],
      memberCount: 0,
      status: 'pending',
      featured: false,
      createdAt: ago(4),
    },
    {
      id: 'community-fintech',
      name: 'FinTech Society',
      slug: 'fintech-society',
      shortDescription: 'Explore how software, markets, and responsible finance come together.',
      description: 'A proposed interdisciplinary society for product workshops, industry conversations, and student research into inclusive financial technology.',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      category: 'Finance & Technology',
      leaderIds: ['student-10'],
      leaderNames: ['Mateo Garcia'],
      memberCount: 0,
      status: 'pending',
      featured: false,
      createdAt: ago(2),
    },
  ]
}

function createEvents(): CampusEvent[] {
  const now = new Date().toISOString()
  const raw: Array<Omit<CampusEvent, 'registrationCount' | 'createdAt' | 'updatedAt'>> = [
    {
      id: 'event-cloud-launch', title: 'Cloud Launch Lab',
      description: 'Build and deploy your first serverless application with AWS.',
      details: 'Bring a laptop and follow a guided build from idea to deployed API. Club mentors will cover Lambda, API Gateway, DynamoDB, and practical cost controls. No prior AWS experience is required.',
      organizerId: 'organizer-cloud', organizerName: 'AWS Cloud Club', communityId: 'community-aws', category: 'Technology',
      startAt: fromNow(3, 17, 30), endAt: fromNow(3, 20), location: 'Innovation Lab · Room 2.14', format: 'In person', capacity: 40,
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=85', status: 'published', featured: true, tags: ['AWS', 'Serverless', 'Beginner'],
    },
    {
      id: 'event-hackathon', title: '48-Hour Campus Hack',
      description: 'Team up to solve a challenge that improves student life.',
      details: 'Designers, developers, storytellers, and problem-solvers are all welcome. Teams receive mentor support, cloud credits, meals, and a chance to present to university leaders.',
      organizerId: 'organizer-tech', organizerName: 'Google Developer Student Club', communityId: 'community-gdsc', category: 'Hackathons',
      startAt: fromNow(8, 16), endAt: fromNow(10, 16), location: 'Engineering Atrium', format: 'Hybrid', capacity: 120,
      imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=85', status: 'published', featured: true, tags: ['Hackathon', 'Teams', 'Prizes'],
    },
    {
      id: 'event-genai', title: 'Build with Generative AI',
      description: 'Prototype a responsible AI assistant in one practical workshop.',
      details: 'Learn prompt design, retrieval patterns, evaluation basics, and responsible AI guardrails. The workshop uses a prepared notebook so participants can focus on concepts and experimentation.',
      organizerId: 'organizer-tech', organizerName: 'AI and Machine Learning Society', communityId: 'community-ai', category: 'Workshops',
      startAt: fromNow(12, 18), endAt: fromNow(12, 20), location: 'Computing Building · C301', format: 'Hybrid', capacity: 6,
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=85', status: 'published', featured: true, tags: ['AI', 'Workshop', 'Responsible tech'],
    },
    {
      id: 'event-career', title: 'Career Ready Sprint',
      description: 'Improve your CV, portfolio, interview story, and job-search plan.',
      details: 'Career coaches and alumni recruiters will run focused stations. Leave with actionable feedback, a stronger personal pitch, and a four-week application plan.',
      organizerId: 'organizer-innovation', organizerName: 'Innovation Centre', category: 'Career Development',
      startAt: fromNow(16, 13), endAt: fromNow(16, 17), location: 'Careers Hub', format: 'In person', capacity: 70,
      imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=85', status: 'published', featured: false, tags: ['Careers', 'CV', 'Interview'],
    },
    {
      id: 'event-founder', title: 'Founder Fireside: From Campus to Company',
      description: 'Hear the honest story behind an alumni-led climate startup.',
      details: 'An informal conversation about finding the first customer, building while studying, early failures, fundraising, and staying focused on a meaningful problem.',
      organizerId: 'organizer-innovation', organizerName: 'Entrepreneurship Society', communityId: 'community-entrepreneurship', category: 'Entrepreneurship',
      startAt: fromNow(20, 18, 30), endAt: fromNow(20, 20), location: 'Business School Auditorium', format: 'In person', capacity: 150,
      imageUrl: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1400&q=85', status: 'published', featured: true, tags: ['Founders', 'Startups', 'Alumni'],
    },
    {
      id: 'event-cultural', title: 'Cultural Mosaic Night',
      description: 'Celebrate the food, music, stories, and traditions of our campus.',
      details: 'Student groups will host performances, interactive exhibits, and food stalls. Registration is free and helps organizers plan accessibility and catering.',
      organizerId: 'organizer-tech', organizerName: 'Student Technology Office', category: 'Cultural Events',
      startAt: fromNow(25, 17), endAt: fromNow(25, 22), location: 'Central Quad', format: 'In person', capacity: 400,
      imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85', status: 'published', featured: false, tags: ['Culture', 'Community', 'Food'],
    },
    {
      id: 'event-roborace', title: 'RoboRace Challenge',
      description: 'Put your autonomous rover through a fast, obstacle-filled course.',
      details: 'Teams of up to four will tune sensors and navigation code before timed runs. Spectators are welcome. A beginner build clinic runs one week before the competition.',
      organizerId: 'organizer-innovation', organizerName: 'Robotics Society', communityId: 'community-robotics', category: 'Competitions',
      startAt: fromNow(30, 11), endAt: fromNow(30, 16), location: 'Maker Space Arena', format: 'In person', capacity: 80,
      imageUrl: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1400&q=85', status: 'published', featured: false, tags: ['Robotics', 'Competition', 'Hardware'],
    },
    {
      id: 'event-ctf', title: 'Cyber Defense CTF',
      description: 'Solve beginner-friendly security challenges with your team.',
      details: 'A controlled capture-the-flag event covering web security, cryptography, forensics, and incident response. Participation requires agreement to the society ethics policy.',
      organizerId: 'organizer-cloud', organizerName: 'Cybersecurity Society', communityId: 'community-cyber', category: 'Competitions',
      startAt: fromNow(36, 10), endAt: fromNow(36, 18), location: 'Cyber Lab · S110', format: 'In person', capacity: 60,
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=85', status: 'published', featured: true, tags: ['Security', 'CTF', 'Teams'],
    },
    {
      id: 'event-serverless', title: 'Serverless API Bootcamp',
      description: 'Design a secure, scalable REST API using event-driven services.',
      details: 'This intermediate lab focuses on API design, authorization, observability, conditional writes, and deployment automation. Complete the setup guide before arriving.',
      organizerId: 'organizer-cloud', organizerName: 'AWS Cloud Club', communityId: 'community-aws', category: 'Workshops',
      startAt: fromNow(45, 17), endAt: fromNow(45, 20), location: 'Cloud Lab · C214', format: 'Hybrid', capacity: 35,
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=85', status: 'published', featured: false, tags: ['AWS', 'API', 'Intermediate'],
    },
    {
      id: 'event-design-thinking', title: 'Design Thinking for Impact',
      description: 'Use human-centered methods to shape a campus improvement idea.',
      details: 'Interview, map, sketch, and test in a facilitated session for mixed-discipline teams. You can bring an existing idea or join a challenge team on the day.',
      organizerId: 'organizer-innovation', organizerName: 'Entrepreneurship Society', communityId: 'community-entrepreneurship', category: 'Workshops',
      startAt: fromNow(55, 14), endAt: fromNow(55, 17), location: 'Design Studio · D204', format: 'In person', capacity: 45,
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=85', status: 'published', featured: false, tags: ['Design', 'Impact', 'Workshop'],
    },
  ]

  return raw.map((event) => ({ ...event, registrationCount: 0, createdAt: now, updatedAt: now }))
}

function createRegistrations(): EventRegistration[] {
  const assignments: Record<string, number[]> = {
    'event-cloud-launch': [1, 2, 4, 5, 8, 12, 17, 18],
    'event-hackathon': [1, 3, 4, 5, 7, 8, 10, 13, 14, 17, 20],
    'event-genai': [1, 5, 8, 12, 14, 20],
    'event-career': [3, 4, 9, 10, 13, 15, 17, 19],
    'event-founder': [3, 9, 10, 13, 15, 17],
    'event-cultural': [2, 3, 6, 9, 11, 15, 18, 19],
    'event-roborace': [2, 6, 12, 16, 20],
    'event-ctf': [4, 7, 8, 12, 14, 20],
    'event-serverless': [1, 4, 12, 14, 17],
    'event-design-thinking': [3, 10, 13, 15, 19],
  }

  return Object.entries(assignments).flatMap(([eventId, studentNumbers], eventIndex) =>
    studentNumbers.map((number, index) => ({
      eventId,
      userId: `student-${String(number).padStart(2, '0')}`,
      registeredAt: ago(14 - ((eventIndex + index) % 12), 9 + (index % 6)),
      status: 'registered' as const,
      attendance: 'pending' as const,
    })),
  )
}

function createMemberships(): CommunityMembership[] {
  const assignments: Record<string, number[]> = {
    'community-aws': [1, 4, 7, 8, 12, 14, 17, 20],
    'community-gdsc': [1, 4, 5, 8, 13, 17, 18, 20],
    'community-ai': [1, 5, 7, 11, 12, 14, 17, 20],
    'community-robotics': [2, 6, 12, 16, 20],
    'community-cyber': [4, 7, 8, 12, 14, 20],
    'community-entrepreneurship': [3, 9, 10, 13, 15, 17, 19],
  }

  return Object.entries(assignments).flatMap(([communityId, studentNumbers], communityIndex) =>
    studentNumbers.map((number, index) => ({
      communityId,
      userId: `student-${String(number).padStart(2, '0')}`,
      joinedAt: ago(90 - communityIndex * 5 - index),
      role: 'member' as const,
    })),
  )
}

function createAnnouncements(): Announcement[] {
  return [
    {
      id: 'announcement-registration',
      title: 'Spring module registration opens Monday',
      summary: 'Review your study plan and adviser notes before registration opens at 9:00 AM.',
      body: 'Spring module registration opens Monday at 9:00 AM through the student records portal. Please review your degree audit, confirm prerequisites, and read any notes from your academic adviser before submitting. The registry help desk will offer extended hours throughout registration week.',
      category: 'Academic', authorId: 'admin-01', authorName: 'Office of Academic Affairs', scope: 'campus', publishedAt: ago(1, 9), status: 'published', priority: 'important',
    },
    {
      id: 'announcement-cloud-credits',
      title: 'Cloud project credits now available',
      summary: 'Student builders can apply for a limited package of AWS learning credits.',
      body: 'The AWS Cloud Club has secured a limited number of learning-credit packages for active student projects. Submit a short project summary, intended architecture, and estimated usage. Requests are reviewed weekly while credits remain available.',
      category: 'Opportunities', authorId: 'organizer-cloud', authorName: 'AWS Cloud Club', scope: 'community', communityId: 'community-aws', publishedAt: ago(2, 14), status: 'published', priority: 'normal',
    },
    {
      id: 'announcement-library',
      title: 'Library extends weekend opening hours',
      summary: 'The main library will remain open until midnight on Friday and Saturday.',
      body: 'In response to student feedback, the main library will remain open until midnight every Friday and Saturday through the assessment period. Security escorts and the late shuttle will run on the usual schedule.',
      category: 'Campus Life', authorId: 'admin-01', authorName: 'Campus Services', scope: 'campus', publishedAt: ago(3, 11), status: 'published', priority: 'normal',
    },
    {
      id: 'announcement-hack-mentors',
      title: 'Mentors wanted for Campus Hack',
      summary: 'Graduate students and alumni can volunteer for two-hour mentor blocks.',
      body: 'We are recruiting technical, design, business, and research mentors for the 48-Hour Campus Hack. Volunteers can choose a two-hour block and will receive a briefing before the event.',
      category: 'Events', authorId: 'organizer-tech', authorName: 'Google Developer Student Club', scope: 'community', communityId: 'community-gdsc', publishedAt: ago(4, 15), status: 'published', priority: 'normal',
    },
    {
      id: 'announcement-innovation-grant',
      title: 'Student innovation grants: applications open',
      summary: 'Apply for up to $2,000 to test a student-led idea with measurable campus impact.',
      body: 'The Innovation Centre is accepting applications for small proof-of-concept grants. Proposals should define a campus need, a testable idea, a six-week plan, and measurable outcomes. Cross-disciplinary teams are encouraged.',
      category: 'Opportunities', authorId: 'organizer-innovation', authorName: 'Innovation Centre', scope: 'campus', publishedAt: ago(5, 10), status: 'published', priority: 'important',
    },
    {
      id: 'announcement-shuttle',
      title: 'Temporary evening shuttle route change',
      summary: 'The north residence stop moves to College Avenue for three evenings.',
      body: 'Road maintenance will close the north residence loop from Tuesday through Thursday after 6:00 PM. During this period, evening shuttles will use the marked temporary stop on College Avenue.',
      category: 'Important', authorId: 'admin-01', authorName: 'Campus Services', scope: 'campus', publishedAt: ago(6, 8), status: 'published', priority: 'important',
    },
    {
      id: 'announcement-robotics-clinic',
      title: 'Beginner robotics clinic adds a second session',
      summary: 'A second introductory build clinic is now open after the first reached capacity.',
      body: 'The Robotics Society has added another beginner clinic covering motor control, sensors, and basic ROS concepts. Components are provided, and no prior hardware experience is needed.',
      category: 'Events', authorId: 'organizer-innovation', authorName: 'Robotics Society', scope: 'community', communityId: 'community-robotics', publishedAt: ago(7, 16), status: 'published', priority: 'normal',
    },
    {
      id: 'announcement-wellbeing',
      title: 'Assessment wellbeing drop-in sessions',
      summary: 'Counsellors and peer supporters are available without appointment this month.',
      body: 'Student Wellbeing is running weekday drop-in sessions from 2:00 PM to 5:00 PM throughout the assessment period. Visit the Wellbeing Centre or join a confidential online check-in through the student support portal.',
      category: 'Campus Life', authorId: 'admin-01', authorName: 'Student Wellbeing', scope: 'campus', publishedAt: ago(8, 12), status: 'published', priority: 'normal',
    },
  ]
}

export function createDemoDatabase(): DemoDatabase {
  const users = createUsers()
  const events = createEvents()
  const communities = createCommunities()
  const registrations = createRegistrations()
  const memberships = createMemberships()

  for (const event of events) {
    event.registrationCount = registrations.filter((item) => item.eventId === event.id && item.status === 'registered').length
  }
  for (const community of communities) {
    community.memberCount = memberships.filter((item) => item.communityId === community.id).length
  }

  return {
    version: 1,
    users,
    events,
    registrations,
    communities,
    memberships,
    announcements: createAnnouncements(),
    notifications: [
      { id: 'notification-1', userId: 'student-01', title: 'Registration confirmed', message: 'You are registered for Cloud Launch Lab.', type: 'event', link: '/events/event-cloud-launch', createdAt: ago(1), readAt: undefined },
      { id: 'notification-2', userId: 'student-01', title: 'New community update', message: 'AWS Cloud Club posted a new opportunity.', type: 'announcement', link: '/announcements/announcement-cloud-credits', createdAt: ago(2), readAt: ago(1) },
    ],
    activities: [
      { id: 'activity-1', action: 'published an announcement', actorName: 'Office of Academic Affairs', targetName: 'Spring module registration', createdAt: ago(1) },
      { id: 'activity-2', action: 'created an event', actorName: 'AWS Cloud Club', targetName: 'Serverless API Bootcamp', createdAt: ago(2) },
      { id: 'activity-3', action: 'updated a community', actorName: 'Innovation Centre', targetName: 'Robotics Society', createdAt: ago(3) },
      { id: 'activity-4', action: 'joined the platform', actorName: 'Rayan Chowdhury', targetName: 'CampusConnect', createdAt: ago(4) },
    ],
    credentialHashes: {},
  }
}

export const DEMO_PASSWORD = 'demo123'
export const DEMO_ACCOUNTS = [
  { role: 'Student', email: 'aisha.khan@campus.edu', password: DEMO_PASSWORD },
  { role: 'Organizer', email: 'cloudclub@campus.edu', password: DEMO_PASSWORD },
  { role: 'Administrator', email: 'admin@campus.edu', password: DEMO_PASSWORD },
] as const
