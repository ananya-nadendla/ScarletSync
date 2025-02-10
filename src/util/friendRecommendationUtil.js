// friendRecommendationUtil.js
// This file contains functions to calculate similarity between profiles
// and generate friend recommendations based on weighted matching.

export const calculateSimilarity = (currentProfile, otherProfile) => {
    let score = 0;
  
    // Major: 10 points per matching major (assumed arrays)
    if (currentProfile.major && otherProfile.major) {
      const commonMajors = currentProfile.major.filter((major) =>
        otherProfile.major.includes(major)
      );
      score += commonMajors.length * 10;
    }
  
    // Minor: 5 points per matching minor (assumed arrays)
    if (currentProfile.minor && otherProfile.minor) {
      const commonMinors = currentProfile.minor.filter((minor) =>
        otherProfile.minor.includes(minor)
      );
      score += commonMinors.length * 5;
    }
  
    // Interests: 3 points per matching interest (assumed stored in selectedSubInterests arrays)
    if (currentProfile.selectedSubInterests && otherProfile.selectedSubInterests) {
      const commonInterests = currentProfile.selectedSubInterests.filter((interest) =>
        otherProfile.selectedSubInterests.includes(interest)
      );
      score += commonInterests.length * 3;
    }
  
    // Campus: 4 points if campus locations match
    if (
      currentProfile.campusLocation &&
      otherProfile.campusLocation &&
      currentProfile.campusLocation === otherProfile.campusLocation
    ) {
      score += 4;
    }
  
    // Year: 2 points if school years match exactly, 1 point if they differ by 1
    if (currentProfile.schoolYear && otherProfile.schoolYear) {
      const currentYear = Number(currentProfile.schoolYear);
      const otherYear = Number(otherProfile.schoolYear);
      const diff = Math.abs(currentYear - otherYear);
      if (diff === 0) {
        score += 2;
      } else if (diff === 1) {
        score += 1;
      }
    }
  
    return score;
  };
  
  export const getFriendRecommendations = (currentUserUid, currentProfile, profiles) => {
    if (!currentProfile || !profiles) return [];
  
    // Filter out the current user's profile
    const filteredProfiles = profiles.filter((profile) => profile.id !== currentUserUid);
  
    // Compute similarity score for each profile
    const recommendations = filteredProfiles.map((profile) => ({
      ...profile,
      similarityScore: calculateSimilarity(currentProfile, profile),
    }));
  
    // Sort recommendations by descending similarity score
    recommendations.sort((a, b) => b.similarityScore - a.similarityScore);
  
    // Return the top 5 recommendations
    return recommendations.slice(0, 5);
  };
  