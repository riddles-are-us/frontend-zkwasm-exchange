import { UserState } from "../data/state";

interface playerInfoProps {
  playerState: UserState | null;
}

export const PlayerInfo: React.FC<playerInfoProps> = ({ playerState }) => {
  return (
    <div className="mt-3 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {playerState && playerState.player ? (
          Object.entries(playerState.player.data.positions).map(([tokenIndex, position]) => (
            <div key={tokenIndex} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
              <h6 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Token {tokenIndex}
              </h6>
              <p className="mb-1 text-gray-800 dark:text-gray-200">
                <strong>Balance:</strong> {position.balance}
              </p>
              <p className="text-gray-800 dark:text-gray-200">
                <strong>Locked:</strong> {position.lock_balance}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 text-center">
            <h6 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              No player available
            </h6>
            <p className="text-gray-800 dark:text-gray-200">
              Please connect wallet and login apps to view balances.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}