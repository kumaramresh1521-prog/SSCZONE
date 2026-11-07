/**
 * High-Precision Math Question Classifier
 * Maps question content to topic_ids (182 to 221)
 */

export const MATH_TOPIC_NAMES: Record<number, string> = {
  182: "Number System",
  183: "Number series",
  184: "HCF and LCM",
  185: "Simlpification",
  186: "Average",
  187: "Ratio and Proportion",
  188: "Problem based on ages",
  189: "Percentage",
  190: "profit and loss",
  191: "Discount",
  192: "Mixture and Alligation",
  193: "Partnership",
  194: "Simple and Interest",
  195: "Compound Interest",
  196: "Work and TIME",
  197: "Pipes and Cisterns",
  198: "Time , Speed and Distance",
  199: "Problem Based on train",
  200: "Boats and Streams",
  201: "Algebric Polynomial and identities",
  202: "Linear and Quadratic Equation",
  203: "Progression",
  204: "Indices and Surds",
  205: "Set theory",
  206: "Permutation and Combination",
  207: "Probablity",
  208: "Lines and angles",
  209: "triangles",
  210: "Quadrilateral and polygon",
  211: "Circle",
  212: "Area and perimeter",
  213: "Surface Area and Volume",
  214: "Coordinate Geometry",
  215: "Trigonometry",
  216: "Height and Distance",
  217: "Statistics",
  218: "Tabulation",
  219: "Bar graph",
  220: "Line graph",
  221: "Pie or Circular chart",
};

export function classifyMathQuestion(text?: string | null): number {
  if (!text) return 182;
  const t = text.toLowerCase();

  // 1. Data Interpretation - Figures without text or DI keywords
  if (
    /^table\s*-/i.test(text.trim()) ||
    /^!\[figure\]/i.test(text.trim()) ||
    /^\[image:/i.test(text.trim()) ||
    /bar diagram|bar graph|pie chart|line graph|histogram|table shows|monthly sales|sales person|unemployment rates.*bar diagram|production of \w+ from|तालिका|दंड आरेख|पाई चार्ट/i.test(t)
  ) {
    if (/pie/i.test(t)) return 221; // Pie chart
    if (/bar/i.test(t)) return 219; // Bar graph
    if (/line graph/i.test(t)) return 220; // Line graph
    return 218; // Tabulation (DI Table)
  }

  // 2. Height and Distance (must precede raw trig)
  if (
    /angle of elevation|angle of depression|top of a tower|shadow of a tower|foot of the tower|top of a cliff|height of the cliff|top of a building|light house|ladder.*(?:wall|ground|angle)|wire supports a vertical pole|taut wire|elevation are \d+|angles of elevation|angles of depression|उन्नयन कोण|अवनमन कोण|मीनार की ऊंचाई/i.test(t)
  ) {
    return 216; // Height and Distance
  }

  // 3. Coordinate Geometry
  if (
    /perpendicular bisector.*(?:line segment|points)|line segment connecting points|equation of the line|equation of line|slope of the line|slope of a line|which line has slope|with slope -?\d+|parallel to the line|graph of y =|graph of the equation|y = mx \+ c|is parallel to \d+x|\bcollinear\b|coordinates of|distance between.*points|which type of line has a slope|quadrant|slope of line perpendicular|line y = mx|y-intercept|midpoint of segment|segment joining \(|two lines are perpendicular and one has a slope|the line y = .* passes through|slope equal to zero|points?\s*[a-z]?\s*\(-?\d+\s*,\s*-?\d+\)|ढलान|निर्देशांक/i.test(t)
  ) {
    return 214; // Coordinate Geometry
  }

  // 4. Set Theory
  if (/\bset\s+[ab]\b|finite subset|infinite subset|subsets of|universal set|null set|cardinality strictly between|cantor set|समुच्चय/i.test(t)) {
    return 205; // Set theory
  }

  // 5. Permutation and Combination
  if (/permutation|combination|how many ways.*(?:arranged|selected|committee)|can be arranged in a row|factorial|क्रमचय|संचय/i.test(t)) {
    return 206; // Permutation and Combination
  }

  // 6. Probability
  if (/probability|dice are rolled|die is thrown|cards.*drawn|pack of 52|coin is tossed|प्रायिकता/i.test(t)) {
    return 207; // Probability
  }

  // 7. Statistics
  if (/\bmode\b|\bmedian\b|\bvariance\b|standard deviation|mean deviation|frequency distribution|बहुलक|माध्यिका/i.test(t)) {
    return 217; // Statistics
  }

  // 8. Circles (Geometry) - must be before raw Trig so "tangent" / "secant" goes to Circle!
  if (
    /\bconcentric circles?|\bchords?\b|\btangents?\b|\bsecants?\b|radius of a circle|radius of the circle|radii|diameter of a circle|diameter of \d+|arc of a circle|in a circle|circle with centre|circles? intersect|minor arc|major arc|cyclic quadrilateral|sector of a circle|central angle of \d+°|central angle of.*radians|circular wheel|circular clock|circular signboard|wire.*bent into.*circle|circle is circumscribed|circle has a radius of|circle touches all|hexagon.*inside a circle|circle is inscribed|circular logo of radius|circular pizza|circles? represented by the equations|points on a circle|subtended by the chords|common tangents?|two circles|distinct circles|touching internally.*tangent|tangents.*drawn to a circle|वृत्त|जीवा|स्पर्श रेखा|स्पर्शरेखा|त्रिज्या|व्यास/i.test(t)
  ) {
    return 211; // Circle
  }

  // 9. Triangles (Geometry)
  if (
    /equilateral triangle|isosceles triangle|right-angled triangle|hypotenuse|orthocenter|centroid|incenter|circumcenter|[△Δ]\s*[a-z]{3}|[△Δ]|triangle|bisector of ∠|altitudes drawn from vertices|altitudes intersect|similar triangle|congruent triangle|statements about its centers|sides are \d+.*how many integer values.*possible|area of a triangle is \d+.*base is|समबाहु त्रिभुज|समद्विबाहु त्रिभुज|समकोण त्रिभुज|केन्द्रक|माध्यिका|त्रिभुज/i.test(t)
  ) {
    return 209; // triangles
  }

  // 10. Quadrilateral and polygon (Geometry)
  if (
    /\bquadrilateral\b|\bparallelogram\b|\brhombus\b|\btrapezium\b|\btrapezoid\b|\bpolygons?\b|\bregular polygons?\b|\bregular hexagon\b|\bpentagon\b|\bhexagon\b|exterior angles?|interior angle.*polygon|exterior angle.*polygon|hexagonal tiles|चतुर्भुज|समांतर चतुर्भुज|समचतुर्भुज|समलंब|बहुभुज/i.test(t)
  ) {
    return 210; // Quadrilateral and polygon
  }

  // 11. Lines and angles (Geometry)
  if (
    /parallel lines|transversal|supplementary angle|complementary angle|vertically opposite angle|lines ab and cd|angle between two lines|supplement of ∠|complement of ∠|समानांतर रेखाएं|पूरक कोण|संपूरक कोण/i.test(t)
  ) {
    return 208; // Lines and angles
  }

  // 12. Surface Area and Volume (3D Mensuration)
  if (
    /\bcylinder\b|\bcylindrical\b|\bcone\b|\bconical\b|\bsphere\b|\bspherical\b|\bhemisphere\b|\bhemispherical\b|\bcuboids?\b|\bcuboidal\b|\bcubes?\b|\bprism\b|\bpyramid\b|curved surface area|total surface area|volume of|melted and recast|rectangular box has dimensions|rectangular parallelepiped|spherical iron ball|cubical cake|cubical pieces|can hold \d+ liters|arranged inside without gaps|बेलन|शंकु|गोला|अर्धगोला|घनाभ|घन\b|आयतन/i.test(t)
  ) {
    return 213; // Surface Area and Volume
  }

  // 13. Area and perimeter (2D Mensuration)
  if (
    /perimeter of|circumference|area of the rectangular|area of rectangle|area of square|cost of fencing|fenced at ₹|area of rhombus|area of trapezium|square garden has side|square lawn is enclosed|area of the path|diagonal of a rectangle|area of a rectangle|square field of side.*circular pond|circular pond is surrounded by a path|area of a square is.*circle is inscribed|revolutions.*distance covered|परिमाप|परिधि|क्षेत्रफल/i.test(t)
  ) {
    return 212; // Area and perimeter
  }

  // 14. Trigonometry
  if (
    /\bradian\b|\bradians\b|degree measure|value of θ|acute angle|त्रिकोणमिति|(?<![a-z])(sin|cos|tan|cot|sec|cosec)(\^2|\^3|\^4|²|³|⁴|\s*[\(θθαβγφ\d]|(\s+(?:[A-Z]|[a-z]\b|\d+°)))|sin\^|cos\^|tan\^|cot\^|sec\^|cosec\^|sin²|cos²|tan²|cot²|sec²|cosec²|sin\(|cos\(|tan\(|cot\(|sec\(|cosec\(|\btan\s*[a-z]\b|\bsec\s*[a-z]\b|\bcot\s*[a-z]\b|\bsin\s*[a-z]\b|\bcos\s*[a-z]\b/i.test(t)
  ) {
    return 215; // Trigonometry
  }

  // 15. Boats and Streams
  if (
    /\bboat\b|\bmotorboat\b|speed of.*stream|speed of.*boat|still water|downstream|upstream|नाव|धारा|शांत जल|अनुप्रवाह|ऊर्ध्वप्रवाह/i.test(t)
  ) {
    return 200; // Boats and Streams
  }

  // 16. Problem based on train
  if (
    /\btrain\b|two trains|crosses a pole|crosses a platform|crosses a bridge|length of the train|speed of the train|speed of train|ट्रेन|रेलगाड़ी|प्लेटफॉर्म/i.test(t)
  ) {
    return 199; // Problem Based on train
  }

  // 17. Time, Speed and Distance
  if (
    /km\/h|kmph|m\/s\b|m\/sec|speed of a car|walking at a speed|travels a distance|average speed|reaches late|reaches early|constant speeds|journey|speed of \d+|circular track|race of \d+|thief and police|car travels.*km in|cross paths|at what specific time did they meet|start moving simultaneously|चाल|दूरी|किमी\/घंटा|गति/i.test(t)
  ) {
    return 198; // Time , Speed and Distance
  }

  // 18. Pipes and Cisterns
  if (
    /\bcistern\b|\bpipe [a-z]\b|\bpipes [a-z]\b|\btap [a-z]\b|drainpipe|drainage pipe|empties the tank|fills the tank|fill the pool|tank in \d+ (?:hours|minutes)|leak in the tank|water every second|liters.*drained twice|flooding it with junk data|टंकी|पाइप|हौज|नल/i.test(t)
  ) {
    return 197; // Pipes and Cisterns
  }

  // 19. Work and Time
  if (
    /piece of work|complete the work|finish the work|working together|can do a work|efficiency of|wages of|alone can do|men can do|women can do|complete a certain work alone in|complete a work in|alone completes a work in|with the help of an assistant|can complete a task in \d+ days|can build up a wall in \d+ days|potter can craft|is able to complete a task in|efficient as a worker than|complete a certain task together in|capable of completing a job in|a alone can complete a job in|can lay railway track|can break it in \d+ days|team of \d+ men and \d+ women|complete arranging it in|works with \d+%.*efficiency|कार्य|काम पूरा कर सकता है|मिलकर कार्य/i.test(t)
  ) {
    return 196; // Work and TIME
  }

  // 20. Partnership
  if (
    /\bpartnership\b|invested ₹|investment of|started a business|starts a business|start a business|profit sharing ratio|joined him with|joined with ₹|withdrew ₹|withdrew half of his capital|invests ₹|investment was thrice|b's share in a ₹|alok starts a business|share a rented field|rent a field|rented a field|rent a pasture|puts \d+ oxen for \d+ months|places \d+ horses in the field|uses \d+ cows for a duration|utilizes \d+ horses for \d+ months|a and b invest ₹|business venture|invests three times|find the share of.*in the profit|साझेदारी|व्यापार शुरू किया|निवेश/i.test(t)
  ) {
    return 193; // Partnership
  }

  // 21. Compound Interest
  if (/compound interest|compounded annually|compounded half-yearly|compounded quarterly|amount of a sum at the end of the 1st year|चक्रवृद्धि ब्याज/i.test(t)) {
    return 195; // Compound Interest
  }

  // 22. Simple Interest
  if (/simple interest|rate of simple interest|sum doubles itself in|sum becomes \d+ times at simple|साधारण ब्याज/i.test(t)) {
    return 194; // Simple and Interest
  }

  // 23. Discount
  if (/marked price|discount|successive discount|single equivalent discount|list price|allow a discount|marked at ₹|छूट|अंकित मूल्य|बट्टा/i.test(t)) {
    return 191; // Discount
  }

  // 24. Profit and Loss
  if (
    /cost price|selling price|loss percentage|profit percentage|sold for ₹|bought for ₹|marked up by|dishonest dealer|dishonest shopkeeper|\bcp\b.*\bsp\b|\bsp\b.*\bcp\b|gain of|loss of|sold at a loss|sold at a profit|profit of ₹|profit to the cost price|price of \d+ boxes|dealer sells.*profit.*loss|by selling \d+.*a vendor loses|how many.*should he sell for ₹.*to gain|vendor sells.*earning a.*commission|selling \d+ apples|vendor sold \d+.*profit of|समान लाभ|हानि प्रतिशत|क्रय मूल्य|विक्रय मूल्य/i.test(t)
  ) {
    return 190; // profit and loss
  }

  // 25. Problem based on ages
  if (/ratio of ages|years ago.*age|present age|father.*son|mother.*daughter|years hence.*age|आयु|वर्तमान आयु|पिता.*पुत्र/i.test(t)) {
    return 188; // Problem based on ages
  }

  // 26. Mixture and Alligation
  if (
    /mixture of|alligation|ratio of milk and water|acid and water|solution of alcohol and water|replaced with water|vessel contains|liters of pure syrup|drawn off.*syrup|in what ratio should he mix|grocer mixes \d+ kg|pulses.*costing ₹.*mixes|sugar costing ₹.*mixed with|grocer purchased \d+ kg of rice at ₹.*and \d+ kg of another variety|pure spirit, \d+ liters are removed and replaced|container of pure.*removed and replaced|tea at ₹.*per kg and \d+ kg of .* tea at ₹|milk at ₹.*per liter and another \d+ liters of milk at ₹|quantity of water added to \d+ litres of a \d+% alcohol solution|alloy contains \d+% copper, \d+% zinc|mixing both varieties|sells part of it at a profit of \d+% and the remaining at a profit of \d+%/i.test(t)
  ) {
    return 192; // Mixture and Alligation
  }

  // 27. Average
  if (
    /average salary|average weight|average score|average age|batting average|bowling average|cricketer's average|average of \d+ numbers|average of n consecutive|average of first \d+|average of the first \d+|average of all numbers between|average of all integers between|consecutive.*average is|average of any two of them|on average for the first|average height was|average marks in \d+ tests|average of five numbers is|average of all three-digit numbers divisible by|consecutive integers.*average of the \d+ integers is|consecutive numbers is \d+, determine the largest|consecutive even numbers.*consecutive odd numbers|mean of|overall average|what is the average of the three numbers|average units sold|औसत/i.test(t)
  ) {
    return 186; // Average
  }

  // 28. Percentage
  if (
    /\bpercent\b|\bpercentage\b|increased by \d+%|decreased by \d+%|exam.*passed.*failed|population.*increases|population.*decreases|in an election.*voters|corporate shareholder election|voters cast invalid|passed in|failed in|is \d+% more than|is \d+% less than|\b\d+(\.\d+)?%\s*of\s*(?:a\s*number|[a-z]|\d+)\b|voter list did not cast|registered voters vote|literate people is \d+|price of petrol shot up by|\d+%\s*annual return|items equal to \d+% of the total|answered \d+%.*correctly|passing score is \d+%|startups are eliminated|startups fail|total population of village|प्रतिशत|जनसंख्या/i.test(t)
  ) {
    return 189; // Percentage
  }

  // 29. Ratio and Proportion
  if (
    /ratio of|mean proportional|third proportional|fourth proportional|in the ratio|\ba\s*:\s*b\b|\bp\s*:\s*q\b|\bw\s*:\s*x\b|\bm\s*:\s*n\b|compound ratio|duplicate ratio|sub-duplicate ratio|marbles.*in the ratio|ratio between the tens digit|so that the remaining numbers may be proportional|bonus is distributed among.*ratio|what is the ratio [a-z]:\s*[a-z]|find \(5p\+3q\):\(5p-3q\)|अनुपात|समानुपात|मध्याअनुपाती|तृतीयानुपाती|चतुर्थानुपाती/i.test(t)
  ) {
    return 187; // Ratio and Proportion
  }

  // 30. HCF and LCM
  if (
    /\bhcf\b|\blcm\b|highest common factor|least common multiple|greatest number which divides|smallest number divisible by|smallest perfect square divisible by|smallest square number that is divisible|least perfect square divisible by|smallest number that is a perfect square and is also divisible|product of two numbers is \d+.*hcf|महत्तम समापवर्तक|लघुत्तम समापवर्त्य/i.test(t)
  ) {
    return 184; // HCF and LCM
  }

  // 31. Algebra & Polynomials
  if (
    /x\s*\+\s*1\s*\/\s*x|x\^2\s*\+\s*1\s*\/\s*x\^2|x\^3\s*\+\s*1\s*\/\s*x\^3|x\^6\s*\+\s*x\^6|[xy]\s*\+\s*1\s*[xy]\s*=|x⁴\s*\+\s*1|x\^4\s*\+\s*x\^4|x−1\s*x=|a\^3\s*\+\s*b\^3|a³\s*−\s*b|a³\s*\+\s*b³|p³\s*−\s*q|x³\s*\+\s*y³|x³\s*−\s*y³|[xy]³\s*1|[xy]4\s*1|[xy]6\s*1|a\^4\s*\+\s*b\^4|a4\s*\+\s*b4|a\^2\s*\+\s*b\^2|a²\s*\+\s*b²|u²\s*\+\s*v²|u\s*\+\s*v\s*=\s*\d+|x\s*\+\s*y\s*=\s*\d+\s*and\s*xy|a\s*\+\s*b\s*\+\s*c\s*=|p\s*\+\s*q\s*\+\s*r\s*=|a\s*\+\s*b\s*=\s*\d+\s*(?:and|,)\s*ab|if\s*a\s*=\s*\(.*\)²|polynomial|algebraic expression|perfect square trinomial|trinomial square|64x²\s*\+\s*kxy\s*\+\s*81y²|144p²\s*–\s*72p|p²\s*qr\s*\+\s*q2\s*rp|given that p\s*\+\s*q\s*\+\s*r\s*=\s*0|\(x\s*\+\s*=\s*\d+\)|31³\s*\+\s*18³|44³\s*\+\s*35³|19³\s*\+\s*20³|9992\s*-\s*9982|999²\s*-\s*998²|\(x\s*\+\s*2\)²|product\s*\(x\s*-\s*1\)|if\s*3x\s*=\s*2y|if\s*2x\s*=\s*0\.5y|if\s*a\s*\*\s*b\s*=\s*a\s*\+\s*b|if\s*x\(7\s*−\s*3\s*x\)|two real numbers together produce a total of|find the value of k if|for what value of x is the statement|if x - 1\/x =|p\s*-\s*q\s*=\s*\d+\s*and\s*pq\s*=|find the value of \(8a|\(8a\s*\+\s*5b\)²|p²\s*\+\s*q²|बीजगणित/i.test(t)
  ) {
    return 201; // Algebric Polynomial and identities
  }

  // 32. Linear and Quadratic Equation
  if (
    /quadratic equation|roots of the equation|alpha and beta|discriminant|roots are equal|simultaneous equation|2x \+ y = 5|cubic equation.*root|solution of the equation 2x \+ 3y = k|solve system:|द्विघात समीकरण/i.test(t)
  ) {
    return 202; // Linear and Quadratic Equation
  }

  // 33. Progression (AP / GP)
  if (
    /arithmetic progression|geometric progression|\ba\.p\.\b|\bg\.p\.\b|first term.*common difference|sum of first \d+ terms|4 \+ 44 \+ 444|sum of cubes of first n natural|समांतर श्रेणी|गुणोत्तर श्रेणी/i.test(t)
  ) {
    return 203; // Progression
  }

  // 34. Number Series
  if (/number series|find the wrong term|find the next term in the series|complete the series|गलत पद|अगला पद/i.test(t)) {
    return 183; // Number series
  }

  // 35. Indices and Surds / Simplification
  if (/√|cube root|surds|indices|powers of|square root of|घातांक|करणी/i.test(t)) {
    return 204; // Indices and Surds
  }
  if (
    /simplify|bodmas|evaluate|continued fraction|value of 3\.5×3\.5|find the difference:\s*[\d\.]+|add and express the result as a decimal|0\.1 \+ 0\.01 \+ 0\.001|find the product:\s*[\d\.]+|multiply [\d\.]+ by [\d\.]+|which mixed fraction is equal to the decimal|express the recurring decimal|convert [\d\.]+ into a fraction|\(1\s*1\s*2\s*\)³−\(\s*1\s*2\s*\)³|what is the value of \([0-9.]|find the value of \([0-9.]|\b\d+\.\d+³|\[(?:expression|equation) omitted|what is the result of \?|what will come in place of \?|which of the following equals \d+|find the remainder when \(6\.83|2 \+ 1\+ 1 1|fraction in simplest form|given,\s*,\s*then|find the value of \(1\.331|find the value of \(6\.25|find the value of \(4\.6\)|what is the value of \(0\.\d+|सरल करें|सरलीकृत/i.test(t)
  ) {
    return 185; // Simlpification
  }

  // 36. Number System fallback
  return 182; // Number System
}
