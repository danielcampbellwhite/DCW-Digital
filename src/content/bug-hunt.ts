/**
 * Spot the Bug - question pool.
 *
 * Each challenge is a short, realistic snippet with one bug. Line numbers in
 * `bugLines` are 1-based and list every line that counts as a correct answer
 * (some bugs reasonably live on more than one line). Every challenge has a
 * plain-English explanation for non-developers and a technical one for devs.
 */

export type Difficulty = "easy" | "medium" | "hard";

export interface BugChallenge {
  id: string;
  title: string;
  language: string;
  difficulty: Difficulty;
  tags?: ("security" | "data")[];
  /** What the code is supposed to do, in plain English. */
  goal: string;
  code: string[];
  /** 1-based line numbers that count as the bug. */
  bugLines: number[];
  hint: string;
  plain: string;
  dev: string;
  fixed: string[];
}

export const bugChallenges: BugChallenge[] = [
  // ── Easy ────────────────────────────────────────────────────────────────
  {
    id: "off-by-one",
    title: "Shouting the list",
    language: "JavaScript",
    difficulty: "easy",
    goal: "Print every item in the list in capital letters.",
    code: [
      'const items = ["apple", "banana", "cherry"];',
      "",
      "for (let i = 0; i <= items.length; i++) {",
      "  console.log(items[i].toUpperCase());",
      "}",
    ],
    bugLines: [3],
    hint: "Count how many times the loop runs, compared with how many items there are.",
    plain:
      "The loop runs one time too many. On the last go it tries to shout an item that doesn't exist, and the program crashes.",
    dev: "`i <= items.length` lets the loop run with i = 3, but the last index is 2. `items[3]` is undefined, so `.toUpperCase()` throws a TypeError. Use `i < items.length`, or better, a `for...of` loop.",
    fixed: [
      'const items = ["apple", "banana", "cherry"];',
      "",
      "for (let i = 0; i < items.length; i++) {",
      "  console.log(items[i].toUpperCase());",
      "}",
    ],
  },
  {
    id: "assign-not-compare",
    title: "Who's in charge?",
    language: "JavaScript",
    difficulty: "easy",
    tags: ["security"],
    goal: "Only let admins into the admin panel.",
    code: [
      "function canAccessAdmin(user) {",
      '  if (user.role = "admin") {',
      "    return true;",
      "  }",
      "  return false;",
      "}",
    ],
    bugLines: [2],
    hint: "There's a difference between setting something and checking it.",
    plain:
      "Instead of checking whether the person is an admin, it makes them one. So everyone gets into the admin panel.",
    dev: 'A single `=` assigns "admin" to `user.role`. The expression evaluates to that truthy string, so the check always passes, and it mutates the user too. Use strict equality: `===`.',
    fixed: [
      "function canAccessAdmin(user) {",
      '  if (user.role === "admin") {',
      "    return true;",
      "  }",
      "  return false;",
      "}",
    ],
  },
  {
    id: "british-css",
    title: "Very British CSS",
    language: "CSS",
    difficulty: "easy",
    goal: "Make the button text cyan.",
    code: [
      ".button {",
      "  colour: #00e5ff;",
      "  padding: 12px 24px;",
      "  border-radius: 999px;",
      "}",
    ],
    bugLines: [2],
    hint: "CSS was written by Americans.",
    plain:
      "CSS only understands American spelling, so the browser quietly ignores 'colour' and the text stays the default colour. A mistake I may or may not have made more than once.",
    dev: "`colour` isn't a valid property, so the browser drops the declaration without any error. It should be `color`.",
    fixed: [
      ".button {",
      "  color: #00e5ff;",
      "  padding: 12px 24px;",
      "  border-radius: 999px;",
      "}",
    ],
  },
  {
    id: "missing-return",
    title: "Double trouble",
    language: "JavaScript",
    difficulty: "easy",
    goal: "Double a number, so double(4) gives 8.",
    code: [
      "const double = (n) => {",
      "  n * 2;",
      "};",
      "",
      "console.log(double(4)); // expected 8",
    ],
    bugLines: [2],
    hint: "The function works out the answer... then what does it do with it?",
    plain:
      "It does the maths but never hands the answer back, so you get 'undefined' (nothing) instead of 8.",
    dev: "An arrow function with a block body `{ }` needs an explicit `return`. Either `return n * 2;` or drop the braces: `(n) => n * 2`.",
    fixed: [
      "const double = (n) => {",
      "  return n * 2;",
      "};",
      "",
      "console.log(double(4)); // 8",
    ],
  },
  {
    id: "update-no-where",
    title: "One small update",
    language: "SQL",
    difficulty: "easy",
    tags: ["data"],
    goal: "Change customer 42's email address.",
    code: [
      "-- Update customer 42's email address",
      "UPDATE customers",
      "SET email = 'new.email@example.com';",
    ],
    bugLines: [2, 3],
    hint: "Which customers does this actually change?",
    plain:
      "It's missing the part that says which customer to change, so it updates every single customer's email at once. This is the kind of mistake that ruins someone's afternoon.",
    dev: "Without a `WHERE` clause, `UPDATE` hits every row in the table. Add `WHERE id = 42`, and run risky changes inside a transaction so you can roll back.",
    fixed: [
      "-- Update customer 42's email address",
      "UPDATE customers",
      "SET email = 'new.email@example.com'",
      "WHERE id = 42;",
    ],
  },

  // ── Medium ──────────────────────────────────────────────────────────────
  {
    id: "php-sql-injection",
    title: "Look up a user",
    language: "PHP",
    difficulty: "medium",
    tags: ["security"],
    goal: "Fetch a user's details using the ID in the web address.",
    code: [
      "<?php",
      "$id = $_GET['id'];",
      '$sql = "SELECT * FROM users WHERE id = $id";',
      "$user = $db->query($sql)->fetch();",
    ],
    bugLines: [3, 4],
    hint: "What if someone types something that isn't a number into the web address?",
    plain:
      "It pastes whatever the visitor types straight into a database command. A sneaky visitor could slip in a command of their own and read or delete data. This is called SQL injection, and it's one of the oldest tricks there is.",
    dev: "User input is interpolated straight into the SQL string: classic SQL injection. Use a prepared statement with bound parameters so input is always treated as data, never as SQL.",
    fixed: [
      "<?php",
      "$id = $_GET['id'];",
      '$stmt = $db->prepare("SELECT * FROM users WHERE id = ?");',
      "$stmt->execute([$id]);",
      "$user = $stmt->fetch();",
    ],
  },
  {
    id: "csharp-int-division",
    title: "Stuck at 0%",
    language: "C#",
    difficulty: "medium",
    goal: "Show progress as a percentage, so 3 out of 4 shows 75%.",
    code: [
      "int completed = 3;",
      "int total = 4;",
      "",
      "double percent = completed / total * 100;",
      'Console.WriteLine($"{percent}% done");',
    ],
    bugLines: [4],
    hint: "What's 3 divided by 4 if you're only allowed whole numbers?",
    plain:
      "It divides using whole numbers only, so 3 divided by 4 becomes 0 before it multiplies by 100. The progress bar says 0% forever.",
    dev: "Both operands are `int`, so `3 / 4` is integer division and gives 0, and 0 * 100 is still 0. Cast before dividing: `(double)completed / total * 100`.",
    fixed: [
      "int completed = 3;",
      "int total = 4;",
      "",
      "double percent = (double)completed / total * 100;",
      'Console.WriteLine($"{percent}% done");',
    ],
  },
  {
    id: "js-sort",
    title: "Leaderboard chaos",
    language: "JavaScript",
    difficulty: "medium",
    goal: "Sort the scores from lowest to highest.",
    code: [
      "const scores = [100, 25, 3, 42];",
      "",
      "scores.sort();",
      "",
      "console.log(scores); // expected [3, 25, 42, 100]",
    ],
    bugLines: [3],
    hint: "How would a dictionary sort these?",
    plain:
      "It sorts the numbers like words, alphabetically, so 100 comes before 25 because '1' comes before '2'. You get [100, 25, 3, 42].",
    dev: "By default `Array.prototype.sort()` converts elements to strings and compares them as text. Pass a comparator: `scores.sort((a, b) => a - b)`.",
    fixed: [
      "const scores = [100, 25, 3, 42];",
      "",
      "scores.sort((a, b) => a - b);",
      "",
      "console.log(scores); // [3, 25, 42, 100]",
    ],
  },
  {
    id: "react-effect-loop",
    title: "The chatty profile page",
    language: "React",
    difficulty: "medium",
    goal: "Load a user's profile once when the page opens.",
    code: [
      "function Profile({ id }) {",
      "  const [user, setUser] = useState(null);",
      "",
      "  useEffect(() => {",
      "    fetch(`/api/users/${id}`)",
      "      .then((res) => res.json())",
      "      .then(setUser);",
      "  });",
      "",
      "  return <h1>{user?.name}</h1>;",
      "}",
    ],
    bugLines: [8],
    hint: "How often does this effect run?",
    plain:
      "It asks the server for the profile, which updates the page, which makes it ask again... forever. The page hammers the server in an endless loop.",
    dev: "With no dependency array, the effect runs after every render. `setUser` stores a new object, which triggers a re-render and another fetch: an infinite loop. Add `[id]` so it only re-runs when the id changes.",
    fixed: [
      "function Profile({ id }) {",
      "  const [user, setUser] = useState(null);",
      "",
      "  useEffect(() => {",
      "    fetch(`/api/users/${id}`)",
      "      .then((res) => res.json())",
      "      .then(setUser);",
      "  }, [id]);",
      "",
      "  return <h1>{user?.name}</h1>;",
      "}",
    ],
  },
  {
    id: "php-plaintext-password",
    title: "Checking the password",
    language: "PHP",
    difficulty: "medium",
    tags: ["security"],
    goal: "Log a user in if their password is correct.",
    code: [
      "<?php",
      "$user = findUserByEmail($_POST['email']);",
      "",
      "if ($user && $user->password == $_POST['password']) {",
      "  login($user);",
      "}",
    ],
    bugLines: [4],
    hint: "How is the password being stored and compared?",
    plain:
      "It compares the password as plain, readable text, which means passwords are being stored unprotected. If the database ever leaks, everyone's password leaks with it.",
    dev: "A direct comparison means passwords are stored in plain text (and `==` is a loose comparison on top). Store a hash with `password_hash()` and check it with `password_verify()`.",
    fixed: [
      "<?php",
      "$user = findUserByEmail($_POST['email']);",
      "",
      "if ($user && password_verify($_POST['password'], $user->password_hash)) {",
      "  login($user);",
      "}",
    ],
  },

  // ── Hard ────────────────────────────────────────────────────────────────
  {
    id: "async-foreach",
    title: "Saved... or was it?",
    language: "JavaScript",
    difficulty: "hard",
    tags: ["data"],
    goal: "Save every user to the database, then confirm they're all saved.",
    code: [
      "async function saveAll(users) {",
      "  users.forEach(async (user) => {",
      "    await db.save(user);",
      "  });",
      "",
      '  console.log("All users saved!");',
      "}",
    ],
    bugLines: [2],
    hint: "Does forEach wait for anything?",
    plain:
      "It starts saving all the users but announces 'all saved' straight away, before any of them have actually finished. If one fails, nobody finds out.",
    dev: "`forEach` ignores the promises returned by async callbacks, so `saveAll` resolves immediately and any rejection goes unhandled. Use `await Promise.all(users.map(...))`, or a `for...of` loop with `await`.",
    fixed: [
      "async function saveAll(users) {",
      "  await Promise.all(users.map((user) => db.save(user)));",
      "",
      '  console.log("All users saved!");',
      "}",
    ],
  },
  {
    id: "float-money",
    title: "The 30p that never arrives",
    language: "JavaScript",
    difficulty: "hard",
    goal: "Charge the customer when the total comes to exactly 30p.",
    code: [
      "const price = 0.1;",
      "const tax = 0.2;",
      "const total = price + tax;",
      "",
      "if (total === 0.3) {",
      "  chargeCustomer(total);",
      "}",
    ],
    bugLines: [3, 5],
    hint: "Computers store decimals in binary, and some don't fit exactly.",
    plain:
      "Computers can't store some decimal numbers exactly, so 0.1 + 0.2 actually comes out as 0.30000000000000004. It's never exactly 0.3, so the customer never gets charged.",
    dev: "Binary floating point (IEEE 754) can't represent 0.1 or 0.2 exactly, so the sum isn't `=== 0.3`. For money, work in whole pence (integers) or use a decimal library.",
    fixed: [
      "const price = 10; // pence",
      "const tax = 20; // pence",
      "const total = price + tax;",
      "",
      "if (total === 30) {",
      "  chargeCustomer(total);",
      "}",
    ],
  },
  {
    id: "var-closure",
    title: "Counting to three",
    language: "JavaScript",
    difficulty: "hard",
    goal: "Print Step 1, Step 2, Step 3 after a short delay.",
    code: [
      "for (var i = 1; i <= 3; i++) {",
      "  setTimeout(() => {",
      "    console.log(`Step ${i}`);",
      "  }, 1000);",
      "}",
    ],
    bugLines: [1],
    hint: "By the time the messages print, what's the value of i?",
    plain:
      "By the time the messages print a second later, the counter has already finished at 4, so you get 'Step 4' three times.",
    dev: "`var` is function-scoped, so all three callbacks share the same `i`, which is 4 by the time they run. `let` creates a fresh binding for each loop iteration.",
    fixed: [
      "for (let i = 1; i <= 3; i++) {",
      "  setTimeout(() => {",
      "    console.log(`Step ${i}`);",
      "  }, 1000);",
      "}",
    ],
  },
  {
    id: "shallow-copy",
    title: "The copy that isn't",
    language: "JavaScript",
    difficulty: "hard",
    goal: "Copy the profile and add a tag to the copy only.",
    code: [
      'const original = { name: "Dan", tags: ["developer"] };',
      "const copy = { ...original };",
      "",
      'copy.tags.push("lead");',
      "",
      'console.log(original.tags); // expected ["developer"]',
    ],
    bugLines: [2],
    hint: "How deep does the spread operator actually copy?",
    plain:
      "The 'copy' is only a surface copy. The list of tags is still shared with the original, so adding a tag to one adds it to both.",
    dev: "Object spread is a shallow copy: `copy.tags` and `original.tags` point at the same array. Use `structuredClone(original)`, or copy the nested array: `{ ...original, tags: [...original.tags] }`.",
    fixed: [
      'const original = { name: "Dan", tags: ["developer"] };',
      "const copy = structuredClone(original);",
      "",
      'copy.tags.push("lead");',
      "",
      'console.log(original.tags); // ["developer"]',
    ],
  },
];

export const ROUND_MIX: Record<Difficulty, number> = { easy: 3, medium: 3, hard: 2 };
export const BASE_POINTS: Record<Difficulty, number> = { easy: 100, medium: 200, hard: 300 };
