// Georgia counties with their region (north/south)
// South GA = Macon-Bibb and everything south of Columbus-Sandersville-Waynesboro-Augusta line

const SOUTH_GA_COUNTIES = [
  'Appling', 'Atkinson', 'Bacon', 'Baker', 'Baldwin', 'Ben Hill', 'Berrien', 'Bibb',
  'Bleckley', 'Brantley', 'Brooks', 'Bryan', 'Bulloch', 'Burke',
  'Calhoun', 'Camden', 'Candler', 'Charlton', 'Chatham', 'Chattahoochee',
  'Clinch', 'Coffee', 'Colquitt', 'Columbia', 'Cook', 'Crawford', 'Crisp',
  'Decatur', 'Dodge', 'Dooly', 'Dougherty', 'Early', 'Echols', 'Effingham', 'Emanuel',
  'Evans', 'Glascock', 'Glynn', 'Grady', 'Hancock', 'Houston', 'Irwin',
  'Jeff Davis', 'Jefferson', 'Jenkins', 'Johnson', 'Jones',
  'Lanier', 'Laurens', 'Lee', 'Liberty', 'Lincoln', 'Long', 'Lowndes',
  'Macon', 'Marion', 'McDuffie', 'McIntosh', 'Miller', 'Mitchell', 'Monroe', 'Montgomery', 'Muscogee',
  'Peach', 'Pierce', 'Pulaski', 'Quitman',
  'Randolph', 'Richmond',
  'Schley', 'Screven', 'Seminole', 'Stewart', 'Sumter',
  'Talbot', 'Tattnall', 'Taylor', 'Telfair', 'Terrell', 'Thomas', 'Tift', 'Toombs', 'Treutlen', 'Turner', 'Twiggs',
  'Ware', 'Washington', 'Wayne', 'Webster', 'Wheeler', 'Wilcox', 'Wilkinson', 'Worth'
];

export const GA_COUNTIES = [
  'Appling', 'Atkinson', 'Bacon', 'Baker', 'Baldwin', 'Banks', 'Barrow', 'Bartow',
  'Ben Hill', 'Berrien', 'Bibb', 'Bleckley', 'Brantley', 'Brooks', 'Bryan', 'Bulloch',
  'Burke', 'Butts', 'Calhoun', 'Camden', 'Candler', 'Carroll', 'Catoosa', 'Charlton',
  'Chatham', 'Chattahoochee', 'Chattooga', 'Cherokee', 'Clarke', 'Clay', 'Clayton',
  'Clinch', 'Cobb', 'Coffee', 'Colquitt', 'Columbia', 'Cook', 'Coweta', 'Crawford',
  'Crisp', 'Dade', 'Dawson', 'Decatur', 'DeKalb', 'Dodge', 'Dooly', 'Dougherty',
  'Douglas', 'Early', 'Echols', 'Effingham', 'Elbert', 'Emanuel', 'Evans',
  'Fannin', 'Fayette', 'Floyd', 'Forsyth', 'Franklin', 'Fulton',
  'Gilmer', 'Glascock', 'Glynn', 'Gordon', 'Grady', 'Greene', 'Gwinnett',
  'Habersham', 'Hall', 'Hancock', 'Haralson', 'Harris', 'Hart', 'Heard', 'Henry', 'Houston',
  'Irwin', 'Jackson', 'Jasper', 'Jeff Davis', 'Jefferson', 'Jenkins', 'Johnson', 'Jones',
  'Lamar', 'Lanier', 'Laurens', 'Lee', 'Liberty', 'Lincoln', 'Long', 'Lowndes', 'Lumpkin',
  'Macon', 'Madison', 'Marion', 'McDuffie', 'McIntosh', 'Meriwether', 'Miller', 'Mitchell',
  'Monroe', 'Montgomery', 'Morgan', 'Murray', 'Muscogee',
  'Newton', 'Oconee', 'Oglethorpe',
  'Paulding', 'Peach', 'Pickens', 'Pierce', 'Pike', 'Polk', 'Pulaski', 'Putnam',
  'Quitman', 'Rabun', 'Randolph', 'Richmond', 'Rockdale',
  'Schley', 'Screven', 'Seminole', 'Spalding', 'Stephens', 'Stewart', 'Sumter',
  'Talbot', 'Taliaferro', 'Tattnall', 'Taylor', 'Telfair', 'Terrell', 'Thomas',
  'Tift', 'Toombs', 'Towns', 'Treutlen', 'Troup', 'Turner', 'Twiggs',
  'Union', 'Upson',
  'Walker', 'Walton', 'Ware', 'Warren', 'Washington', 'Wayne', 'Webster', 'Wheeler',
  'White', 'Whitfield', 'Wilcox', 'Wilkes', 'Wilkinson', 'Worth'
];

export const getRegionFromCounty = (county) => {
  if (!county) return 'north';
  const normalized = county.replace(/\s*county$/i, '').trim();
  return SOUTH_GA_COUNTIES.some(c => c.toLowerCase() === normalized.toLowerCase()) ? 'south' : 'north';
};
