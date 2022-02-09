package models;

import models.factory.UserFactory;
import play.db.Database;

import javax.inject.Inject;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

/**
 * The type LevelUp.
 * Contains functionality in context of the leveling up process
 */
public class LevelUp {

    private final Database db;

    /**
     * Instantiates a new LevelUp.
     *
     * @param db the db
     */
    @Inject
    public LevelUp(Database db) {
        this.db = db;
    }

    /**
     * Check for level up view model.
     *
     * @param user the user
     * @return the level up view model
     */
    public LevelUpViewModel checkForLevelUp(UserFactory.User user) {
        int userTotalPoints = user.getTotalPoints();
        int userCurrentTier = user.getCurrentTier();
        int userNextTier = userCurrentTier + 1;

        return db.withConnection(conn -> {
            String sql = "SELECT * FROM Tier";
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();


            ArrayList<String[]> rsAsList = new ArrayList<>();
            while (rs.next())
                rsAsList.add(new String[]{rs.getString("idTier"), rs.getString("name"), rs.getString("gesamtpunkte")});

            int iHighestPossibleTier = 0;
            for (int i = 0; i < rsAsList.size(); i++) {
                String[] current = rsAsList.get(i);

                if (Integer.parseInt(current[2]) <= userTotalPoints)
                    iHighestPossibleTier = i;
            }

            String[] nextPossibleTier = rsAsList.get(iHighestPossibleTier);
            String[] currentTier = rsAsList.get(userCurrentTier - 1);
            boolean isLevelUpPossible = Integer.parseInt(rsAsList.get(iHighestPossibleTier)[0]) > userCurrentTier;

            if (isLevelUpPossible) {
                nextPossibleTier = rsAsList.get(userNextTier - 1);
            }

            if (isLevelUpPossible) // User can level up
                return new LevelUpViewModel(true, nextPossibleTier[1], Integer.parseInt(nextPossibleTier[2]), userNextTier, Integer.parseInt(currentTier[2]));
            else if (iHighestPossibleTier < rsAsList.size() - 1) // User can't level up yet
                return new LevelUpViewModel(false, rsAsList.get(iHighestPossibleTier + 1)[1], Integer.parseInt(rsAsList.get(iHighestPossibleTier + 1)[2]), userNextTier, Integer.parseInt(currentTier[2]));
            else // User already is highest level
                return new LevelUpViewModel(false, "", -1, userNextTier, Integer.parseInt(currentTier[2]));
        });
    }

    /**
     * Contains relevant information about a potential Level-Up opportunity.
     * If it is possible and if so, what the next tier is
     */
    public static class LevelUpViewModel {

        boolean isLevelUpPossible;
        String nextTier;
        int nextTierPoints;
        int nextTierAsFigure;
        int currentTierPoints;

        /**
         * Instantiates a new Level up view model.
         *
         * @param isLevelUpPossible the is level up possible
         * @param nextTier          the next tier
         * @param nextTierPoints    the points needed to achieve next tier
         * @param nextTierAsFigure  the next tier as figure
         * @param currentTierPoints the points needed to achieve current tier
         */
        public LevelUpViewModel(boolean isLevelUpPossible, String nextTier, int nextTierPoints, int nextTierAsFigure, int currentTierPoints) {
            this.isLevelUpPossible = isLevelUpPossible;
            this.nextTier = nextTier;
            this.nextTierPoints = nextTierPoints;
            this.nextTierAsFigure = nextTierAsFigure;
            this.currentTierPoints = currentTierPoints;
        }

        /**
         * Is level up possible boolean.
         *
         * @return the boolean
         */
        public boolean isLevelUpPossible() {
            return isLevelUpPossible;
        }

        /**
         * Gets next tier.
         *
         * @return the next tier
         */
        public String getNextTier() {
            return nextTier;
        }

        /**
         * Gets next tier points.
         *
         * @return the next tier points
         */
        public int getNextTierPoints() {
            return nextTierPoints;
        }

        public int getNextTierAsFigure() {
            return nextTierAsFigure;
        }

        public int getCurrentTierPoints() {
            return currentTierPoints;
        }
    }
}
