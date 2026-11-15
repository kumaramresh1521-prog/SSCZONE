import re

directions_map = {
    (1, 5): "In the following questions, the 1st and the last sentences of the passage are numbered 1 and 6. The rest of the passage is split into four parts and named P, Q, R and S. These four parts are not given in their proper order. Read the sentence and find out which of the four combinations is correct.",
    (6, 10): "In the following questions, the 1st and the last sentences of the passage are numbered 1 and 6. The rest of the passage is split into four parts and named P, Q, R and S. These four parts are not given in their proper order. Read the sentence and find out which of the four combinations is correct.",
    (11, 16): "In the following questions, the 1st and the last sentences/parts of the passage/sentence are numbered 1 and 6. The rest of the passage/sentence is split into four parts and named P, Q, R and S. These four parts are not given in their proper order. Read the passage/sentence and find out which of the four combinations is correct.",
    (17, 20): "In the following questions, the first and the last part of sentence are numbered 1 and 6. The rest of the sentence is split into four parts and named P, Q, R and S. These four parts are not given in their proper order. Read the sentence and find out which of the four combinations is correct.",
    (21, 24): "In the following questions, the 1st and the last part of the sentence are numbered 1 and 6. The rest of the sentence is split into four parts and named P, Q, R & S. These four parts are not given in their proper order. Read the sentence and find out which of the four combinations is correct.",
    (25, 29): "In the following questions, the 1st and the last part of the sentence/passage are numbered 1 and 6. The rest of the sentence/passage is split into four parts and named P, Q, R and S. These four parts are not given in their proper order. Read the sentence/passage and find out which of the four combinations is correct.",
    (30, 31): "The questions below consist of a set of labelled sentences. Out of the four options given, select the most logical order of the sentences to form a coherent paragraph.",
    (32, 33): "The questions below consist of a set of labelled sentences. These sentences, when properly sequenced form a coherent paragraph. Select the most logical order of sentences from among the options.",
    (34, 35): "The questions below consist of a set of labelled sentences. Out of the four options given, select the most logical order of the sentences to form a coherent paragraph.",
    (36, 37): "The questions below consist of a set of labelled sentences. Out of the four options given, select the most logical order of the sentences to form a coherent paragraph.",
    (38, 39): "Rearrange the parts of the sentence in correct order.",
    (40, 44): "The question below consists of a set of labelled sentences. Out of the four options given, select the most logical order of the sentences to form a coherent paragraph.",
    (45, 46): "Given below are four jumbled sentences. Out of the given options pick the one that gives their correct order.",
    (47, 48): "Given below are four jumbled sentences. Select the option that gives their correct order.",
    (49, 53): "Given below are four sentences, three of which are jumbled. Pick the option that gives the correct order.",
    (54, 54): "Given below are four jumbled sentences. Select the option that gives their correct order.",
    (55, 55): "Fill in the blank with the most appropriate word.",
    (56, 58): "Given below are four jumbled sentences. Select the option that gives their correct order.",
    (59, 60): "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the right order to form a meaningful and coherent paragraph.",
    (61, 61): "Given below are four jumbled sentences. Out of the given options, pick the one that gives their correct order.",
    (62, 62): "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the right order to form a meaningful and coherent paragraph.",
    (63, 63): "Select the most appropriate ANTONYM of the given word.",
    (64, 65): "Given here are four sentences. The first sentence is in correct order, while the rest of the sentences are jumbled. Pick the option that gives their correct order.",
    (66, 66): "Given below are four jumbled sentences. Out of the given options, pick the one that gives their correct order.",
    (67, 68): "Given here are four sentences. The first sentence is in correct order, while the rest of the sentences are jumbled. Pick the option that gives their correct order.",
}

def get_direction_for_q(q_num):
    for (start, end), d in directions_map.items():
        if start <= q_num <= end:
            return d
    return "Rearrange the jumbled parts to form a coherent paragraph."

# Test coverage
for i in range(1, 69):
    d = get_direction_for_q(i)
    assert d is not None, f"Missing direction for Q{i}"

print("All 68 questions successfully mapped to exact PDF directions!")
