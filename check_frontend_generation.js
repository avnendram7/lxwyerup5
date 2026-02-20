
const firstNames = [
    'Rajesh', 'Priya', 'Amit', 'Neha', 'Vikram', 'Sunita', 'Arun', 'Kavita', 'Sanjay', 'Meera',
    'Rahul', 'Anjali', 'Deepak', 'Pooja', 'Suresh', 'Rekha', 'Vivek', 'Anita', 'Manish', 'Seema',
    'Rakesh', 'Shweta', 'Ajay', 'Nisha', 'Vijay', 'Ritu', 'Ashok', 'Divya', 'Ramesh', 'Sarita',
    'Karan', 'Jyoti', 'Nikhil', 'Preeti', 'Gaurav', 'Shruti', 'Alok', 'Swati', 'Mohit', 'Pallavi',
    'Rohit', 'Megha', 'Tarun', 'Sneha', 'Pankaj', 'Komal', 'Harsh', 'Tanvi', 'Vishal', 'Sakshi'
];

const lastNames = [
    'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Malhotra', 'Kapoor', 'Agarwal', 'Jain', 'Patel',
    'Shah', 'Mehta', 'Reddy', 'Nair', 'Khanna', 'Bhatia', 'Chopra', 'Bansal', 'Saxena', 'Yadav',
    'Mishra', 'Pandey', 'Dubey', 'Srivastava', 'Tiwari', 'Chauhan', 'Rathore', 'Arora', 'Sethi', 'Dhawan',
    'Bajaj', 'Goyal', 'Ahuja', 'Mehra', 'Tandon', 'Kaul', 'Dua', 'Vohra', 'Grover', 'Bhargava'
];

const specializations = [
    'Criminal Law', 'Civil Law', 'Family Law', 'Property Law', 'Corporate Law',
    'Tax Law', 'Labour Law', 'Consumer Law', 'Constitutional Law', 'Intellectual Property',
    'Banking Law', 'Cyber Law', 'Immigration Law', 'Environmental Law', 'Medical Negligence'
];

const generateLawyers = () => {
    return specializations.flatMap((spec, specIndex) => {
        return Array.from({ length: 5 }).map((_, i) => {
            const index = specIndex * 5 + i;
            const firstName = firstNames[index % firstNames.length];
            const lastName = lastNames[index % lastNames.length];
            const fullName = `${firstName} ${lastName}`;

            if (fullName === 'Kavita Agarwal') {
                console.log(`Found Kavita Agarwal! ID: dummy_lawyer_${index + 1}, First: ${firstName}, Last: ${lastName}, Spec: ${spec}`);
            }
            return {
                id: `dummy_lawyer_${index + 1}`,
                name: fullName,
                firstName,
                lastName
            };
        });
    });
};

const lawyers = generateLawyers();
console.log("Total lawyers generated:", lawyers.length);
