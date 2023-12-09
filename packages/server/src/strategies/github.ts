import GitHubStrategy from "passport-github2";
import { User } from "@convey/shared";
import "dotenv/config";

const githubLogin = async (
  accessToken: string,
  refreshToken: string,
  profile: any,
  cb: Function
) => {
  const { emails, id, displayName } = profile;

  try {
    const email = emails[0].value;
    const user = await User.findOne({ email });
    if (user) {
      return cb(null, user);
    } else {
      const newUser = await User.create({
        name: displayName,
        email,
        githubId: id,
        emailVerified: profile.emails[0].verified ?? false,
        provider: "github",
      });
      return cb(null, newUser);
    }
  } catch (err) {
    console.error(err);
    return cb(err);
  }
};

export function github(): GitHubStrategy {
  return new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.DOMAIN_SERVER}${process.env.GITHUB_CALLBACK_URL}`,
      proxy: false,
      scope: ["user:email"],
    },
    githubLogin
  );
}
