// This file contains C++ implementation of the Ludo game logic
// It uses Emscripten to compile to WebAssembly (optional)
// The IDE may show an error for <emscripten/emscripten.h> - this is normal
// unless you have Emscripten SDK installed and configured

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#endif

#include <vector>
#include <string>
#include <set>
#include <map>
#include <cstring>
#include <algorithm>

using namespace std;

struct Token {
    char id[32];
    int player;
    int tokenId;
    int steps;
};

struct Player {
    int id;
    char name[16];
    char color[16];
    int start;
};

struct AdvancedRules {
    bool threeSixes;
    bool killToEnterHome;
};

struct GameState {
    vector<Token> tokens;
    int currentPlayer;
    int diceValue;
    bool diceRolled;
    int winner;
    vector<string> logs;
    map<int, string> playerTypes;
    AdvancedRules advancedRules;
    map<int, int> kills;
    int consecutiveSixes;
};

const int BOARD_SIZE = 52;
const int TOKENS_PER_PLAYER = 4;
const int FINISH_STEPS = 57;
const set<int> SAFE_SQUARES = {0, 8, 13, 21, 26, 34, 39, 47};
const vector<Player> PLAYERS = {
    {0, "Red", "#ff4b4b", 0},
    {1, "Blue", "#4b7bff", 13},
    {2, "Green", "#4bff6a", 26},
    {3, "Yellow", "#ffd24b", 39}
};

GameState* currentState = nullptr;

#ifdef __EMSCRIPTEN__
extern "C" {

EMSCRIPTEN_KEEPALIVE
void createInitialState() {
    if (currentState != nullptr) {
        delete currentState;
    }
    
    currentState = new GameState();
    currentState->tokens.reserve(16);
    
    for (int p = 0; p < 4; p++) {
        for (int t = 0; t < TOKENS_PER_PLAYER; t++) {
            Token token;
            snprintf(token.id, sizeof(token.id), "%d-%d", p, t);
            token.player = p;
            token.tokenId = t;
            token.steps = -1;
            currentState->tokens.push_back(token);
        }
    }
    
    currentState->currentPlayer = 0;
    currentState->diceValue = 0;
    currentState->diceRolled = false;
    currentState->winner = -1;
    currentState->logs.push_back("Game started. Red's turn.");
    currentState->playerTypes[0] = "human";
    currentState->playerTypes[1] = "human";
    currentState->playerTypes[2] = "bot";
    currentState->playerTypes[3] = "bot";
    currentState->advancedRules.threeSixes = true;
    currentState->advancedRules.killToEnterHome = false;
    currentState->kills[0] = 0;
    currentState->kills[1] = 0;
    currentState->kills[2] = 0;
    currentState->kills[3] = 0;
    currentState->consecutiveSixes = 0;
}

EMSCRIPTEN_KEEPALIVE
void setDiceValue(int value) {
    if (currentState != nullptr) {
        currentState->diceValue = value;
        currentState->diceRolled = true;
    }
}

EMSCRIPTEN_KEEPALIVE
int getDiceValue() {
    return currentState ? currentState->diceValue : 0;
}

EMSCRIPTEN_KEEPALIVE
int getCurrentPlayer() {
    return currentState ? currentState->currentPlayer : 0;
}

EMSCRIPTEN_KEEPALIVE
bool isDiceRolled() {
    return currentState ? currentState->diceRolled : false;
}

EMSCRIPTEN_KEEPALIVE
int getWinner() {
    return currentState ? currentState->winner : -1;
}

EMSCRIPTEN_KEEPALIVE
int getTokenCount() {
    return currentState ? currentState->tokens.size() : 0;
}

EMSCRIPTEN_KEEPALIVE
void getTokenId(int index, char* out, int outSize) {
    if (currentState && index < currentState->tokens.size()) {
        strncpy(out, currentState->tokens[index].id, outSize - 1);
        out[outSize - 1] = '\0';
    }
}

EMSCRIPTEN_KEEPALIVE
int getTokenPlayer(int index) {
    return (currentState && index < currentState->tokens.size()) ? currentState->tokens[index].player : -1;
}

EMSCRIPTEN_KEEPALIVE
int getTokenSteps(int index) {
    return (currentState && index < currentState->tokens.size()) ? currentState->tokens[index].steps : -1;
}

EMSCRIPTEN_KEEPALIVE
int getLogCount() {
    return currentState ? currentState->logs.size() : 0;
}

EMSCRIPTEN_KEEPALIVE
void getLog(int index, char* out, int outSize) {
    if (currentState && index < currentState->logs.size()) {
        strncpy(out, currentState->logs[index].c_str(), outSize - 1);
        out[outSize - 1] = '\0';
    }
}

EMSCRIPTEN_KEEPALIVE
int getBoardPositionType(int playerIndex, int steps) {
    if (steps == -1) return 0;
    if (steps == FINISH_STEPS) return 1;
    if (steps >= BOARD_SIZE) return 2;
    return 3;
}

EMSCRIPTEN_KEEPALIVE
int getBoardPositionValue(int playerIndex, int steps) {
    if (steps == -1) return playerIndex;
    if (steps == FINISH_STEPS) return playerIndex;
    if (steps >= BOARD_SIZE) return steps - BOARD_SIZE;
    return (PLAYERS[playerIndex].start + steps) % BOARD_SIZE;
}

bool canMove(const Token& token, int diceValue) {
    if (token.steps == FINISH_STEPS) return false;
    
    if (token.steps == -1) {
        return diceValue == 6;
    }
    
    if (token.steps + diceValue > FINISH_STEPS) return false;
    
    if (currentState->advancedRules.killToEnterHome) {
        if (token.steps + diceValue >= BOARD_SIZE && currentState->kills[token.player] == 0) {
            return false;
        }
    }
    
    return true;
}

EMSCRIPTEN_KEEPALIVE
int getMovableTokenCount() {
    if (!currentState) return 0;
    
    int count = 0;
    for (const auto& token : currentState->tokens) {
        if (token.player == currentState->currentPlayer && canMove(token, currentState->diceValue)) {
            count++;
        }
    }
    return count;
}

EMSCRIPTEN_KEEPALIVE
void getMovableTokenIndex(int movableIndex, int* outIndex) {
    if (!currentState) {
        *outIndex = -1;
        return;
    }
    
    int count = 0;
    for (int i = 0; i < currentState->tokens.size(); i++) {
        if (currentState->tokens[i].player == currentState->currentPlayer && 
            canMove(currentState->tokens[i], currentState->diceValue)) {
            if (count == movableIndex) {
                *outIndex = i;
                return;
            }
            count++;
        }
    }
    *outIndex = -1;
}

EMSCRIPTEN_KEEPALIVE
void moveToken(const char* tokenIdStr) {
    if (!currentState) return;
    
    string tokenId(tokenIdStr);
    int tokenIndex = -1;
    
    for (int i = 0; i < currentState->tokens.size(); i++) {
        if (currentState->tokens[i].id == tokenId) {
            tokenIndex = i;
            break;
        }
    }
    
    if (tokenIndex == -1) return;
    
    Token& token = currentState->tokens[tokenIndex];
    int diceValue = currentState->diceValue;
    
    string moveLog = string(PLAYERS[token.player].name) + " moved token.";
    
    if (token.steps == -1) {
        token.steps = 0;
        moveLog = string(PLAYERS[token.player].name) + " brought a token onto the board.";
    } else {
        token.steps += diceValue;
    }
    
    currentState->logs.push_back(moveLog);
    
    bool getsAnotherTurn = (diceValue == 6);
    bool killed = false;
    
    int posType = getBoardPositionType(token.player, token.steps);
    int posValue = getBoardPositionValue(token.player, token.steps);
    
    if (posType == 3 && SAFE_SQUARES.find(posValue) == SAFE_SQUARES.end()) {
        for (auto& t : currentState->tokens) {
            if (t.player != token.player && t.steps >= 0 && t.steps < BOARD_SIZE) {
                int oppPosType = getBoardPositionType(t.player, t.steps);
                int oppPosValue = getBoardPositionValue(t.player, t.steps);
                
                if (oppPosType == 3 && oppPosValue == posValue) {
                    t.steps = -1;
                    killed = true;
                    currentState->kills[token.player]++;
                    currentState->logs.push_back(string(PLAYERS[token.player].name) + " captured " + PLAYERS[t.player].name + "'s token!");
                    getsAnotherTurn = true;
                }
            }
        }
    }
    
    if (token.steps == FINISH_STEPS) {
        currentState->logs.push_back(string(PLAYERS[token.player].name) + "'s token reached finish!");
        getsAnotherTurn = true;
    }
    
    int finishedTokens = 0;
    for (const auto& t : currentState->tokens) {
        if (t.player == currentState->currentPlayer && t.steps == FINISH_STEPS) {
            finishedTokens++;
        }
    }
    
    if (finishedTokens == TOKENS_PER_PLAYER) {
        currentState->winner = currentState->currentPlayer;
        currentState->logs.push_back(string(PLAYERS[currentState->currentPlayer].name) + " wins!");
        return;
    }
    
    if (diceValue == 6) {
        currentState->consecutiveSixes++;
        if (currentState->advancedRules.threeSixes && currentState->consecutiveSixes == 3) {
            currentState->logs.push_back(string(PLAYERS[currentState->currentPlayer].name) + " rolled three 6s! Turn cancelled and token returned.");
            token.steps = -1;
            getsAnotherTurn = false;
        }
    } else {
        currentState->consecutiveSixes = 0;
    }
    
    currentState->diceRolled = false;
    currentState->diceValue = 0;
    
    if (!getsAnotherTurn) {
        currentState->consecutiveSixes = 0;
        currentState->currentPlayer = (currentState->currentPlayer + 1) % 4;
        currentState->logs.push_back(string(PLAYERS[currentState->currentPlayer].name) + "'s turn.");
    } else {
        if (diceValue == 6 && currentState->consecutiveSixes < 3) {
            currentState->logs.push_back(string(PLAYERS[token.player].name) + " gets another turn!");
        } else if (killed) {
            currentState->logs.push_back(string(PLAYERS[token.player].name) + " gets another turn for capture!");
        } else if (token.steps == FINISH_STEPS) {
            currentState->logs.push_back(string(PLAYERS[token.player].name) + " gets another turn for reaching finish!");
        }
    }
}

EMSCRIPTEN_KEEPALIVE
void cleanup() {
    if (currentState != nullptr) {
        delete currentState;
        currentState = nullptr;
    }
}

}
#endif
