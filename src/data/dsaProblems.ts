export interface TestCase {
  input: string;
  output: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sampleTests: TestCase[];
  hiddenTests: TestCase[];
  starterCode: string;
  suggestedApproach?: string;
}

// Sample problems
export const problems: Problem[] = [
  {
    id: '1',
    title: 'Problem 2',
    description: `In this superhero epic, the denizens of the Marvel Universe are forced to pick sides when Captain America and Iron Man come to blows over ideological differences.
The government decides to push for the Hero Registration Act, a law that limits a hero's actions. This results in a division in The Avengers. Iron Man stands with this Act, claiming that their actions must be kept in check otherwise cities will continue to be destroyed, but Captain America feels that saving the world is daring enough and that they cannot rely on the government to protect the world. And here the civil war begins.

They are trying make their team stronger by adding more avengers to their team. There are N avengers lined up.

Rules to add avenger to their team-

Any team can start first. But they will alternatively only.
They can select avenger from any side. But if they start from one side they can't move to other side in current chance.
They can select consecutive avengers as many they want.
They will stop only when all the avengers are part of either side.
Every Avenger has a power associated with him
There are some spurious avengers who will decrease the overall power of the team.
Both teams will select players optimally. Find the difference of powers of the two teams

Constraints
1<= N <= 10^6
-10^9 <= p[i] <= 10^9

Input
First line contains an integer denoting the number of Avengers(N).
Next lines contain N space separated values denoting power of every avenger(P[i]).

Output
Print the difference of the powers of teams`,
    difficulty: 'hard',
    sampleTests: [
      {
        input: '[4, [5, -3, 7, -1]]',
        output: '0'
      },
      {
        input: '[6, [1, 2, 3, 4, 5, 6]]',
        output: '1'
      }
    ],
    hiddenTests: [
      {
        input: '[5, [-1, -2, -3, -4, -5]]',
        output: '1'
      },
      {
        input: '[3, [1000000000, -1000000000, 999999999]]',
        output: '1'
      },
      {
        input: '[5, [-10, 30, -20, 40, -50]]',
        output: '10'
      },
      {
        input: '[1, [7]]',
        output: '7'
      },
      {
        input: '[6, [5, 5, 5, -5, -5, -5]]',
        output: '0'
      },
      {
        input: '[5, [100, -100, 200, -200, 300]]',
        output: '100'
      },
      {
        input: '[1, [-9]]',
        output: '9'
      }
    ],
    starterCode: `function civilWar(n, powers) {
  // n: number of avengers
  // powers: array of numbers representing the power of each avenger
  // Return the difference in power between the two teams
}`,
    suggestedApproach: "This is a dynamic programming problem where you need to consider optimal choices for both teams. The key is to calculate the maximum difference in power that can be achieved when it's a player's turn to pick avengers."
  },
  {
    id: 'seating-arrangement',
    title: 'Problem 3',
    difficulty: 'medium',
    description: `You are a caretaker of a waiting room and you have to take care of empty seats such that all the people should sit together. Imagine the seats are in a straight line like in a movie theatre. People are seated on random seats initially. Your task is to make them sit together so that minimum number of people change their position. Also, they can be made to sit together in many ways. Find the number of ways you can make them sit together by requiring only minimal people movement.

"E" depicts an empty seat and "O" depicts an occupied seat. Input will be given in the form of a string.

Example: OEOEO
As we can see, only seat number 1, 3, 5 are occupied and 2 and 4 are empty.
Case 1: If we move 5th person to 2nd position, they can all be together with only one person moving his/her place.
Case 2: If we movement 1st person to 4th position, they can all be together with only one person moving his/her place.

They can all be together with only one movement and this can be done in 2 ways. Print the minimum number of movements required and the number of ways this minimum movement can help achieve the objective.

Note: If they are already sitting together, Print "00" as output.

Constraints:
0 < N <= 100000

Input:
First line contains an integer N which depicts the number of seats
Second line contains N characters each of which are either "O" or "E". "O" denotes an occupied seat and "E" denotes an empty seat.

Output:
Print minimum number of movements required and the number of ways in which all people can be made to sit together without exceeding minimum number of movements by space`,
    starterCode: `function solveSeatingArrangement(n, seats) {
  // Write your code here
  // Return the minimum number of movements and number of ways
  // Format: "minMovements numberOfWays"
}`,
    sampleTests: [
      {
        input: '[5, "OEOEO"]',
        output: '1 2'
      }
    ],
    hiddenTests: [
      {
        input: '[1, "E"]',
        output: '0 0'
      },
      {
        input: '[1, "O"]',
        output: '0 0'
      },
      {
        input: '[4, "OOOO"]',
        output: '0 0'
      },
      {
        input: '[5, "OEOEO"]',
        output: '1 2'
      },
      {
        input: '[7, "OEEEOEE"]',
        output: '1 3'
      },
      {
        input: '[6, "EOEOEO"]',
        output: '1 2'
      }
    ],
    suggestedApproach: 'This is a greedy problem where you need to find all possible positions where occupied seats can be grouped together. For each position, calculate the minimum moves needed to group the occupied seats. Keep track of the minimum moves and count how many ways you can achieve that minimum.'
  },
  {
    id: 'two-sum',
    title: 'Problem 1',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers in nums such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]

Constraints:
2 <= nums.length <= 104
-109 <= nums[i] <= 109
-109 <= target <= 109
Only one valid answer exists.`,
    difficulty: 'easy',
    sampleTests: [
      {
        input: '[[2,7,11,15], 9]',
        output: '0,1'
      },
      {
        input: '[[3,2,4], 6]',
        output: '1,2'
      },
      {
        input: '[[3,3], 6]',
        output: '0,1'
      }
    ],
    hiddenTests: [
      {
        input: '[[1,2,3,4,5], 9]',
        output: '3,4'
      },
      {
        input: '[[-1,-2,-3,-4,-5], -8]',
        output: '2,4'
      },
      {
        input: '[[0,4,3,0], 0]',
        output: '0,3'
      },
      {
        input: '[[2,5,5,11], 10]',
        output: '1,2'
      }
    ],
    starterCode: `function twoSum(nums, target) {
  // Write your code here
  // Return an array of two indices whose corresponding numbers add up to target
}`,
    suggestedApproach: 'You can solve this problem using a hash map to store the numbers you have seen so far. For each number, check if its complement (target - current number) exists in the hash map. If it does, you have found your pair. If not, add the current number to the hash map and continue.'
  }
];

export function getProblemById(id: string): Problem | undefined {
  return problems.find(problem => problem.id === id);
}
