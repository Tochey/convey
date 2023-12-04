import { CustomResponse } from "../../utils/custom-res";
import { Request } from "../../types";
import { Github } from "../../lib/github";
import CustomError from "../../utils/custom-err";
import { createCBDeployment } from "../../lib/codebuild";

export async function create(req: Request) {
  // const { uid } = req.ctx.decodedToken
  const { url, branch, buildCommand, startCommand, rootDirectory, port } =
    req.body;

  const res = parseInt(port, 10);

  if (isNaN(res)) {
    throw new CustomError(400, "Port must be a number");
  }
  
  // TODO: get user info from db

  const gh = new Github(url);
  let info: Awaited<ReturnType<typeof gh.validate>>;

  try {
    info = await gh.validate();
  } catch (err: unknown) {
    throw new CustomError(400, (err as Error).message);
  }

  const {
    data: { full_name, clone_url },
  } = info;

  const identifier = full_name.replace("/", "_");

  //TODO: pull branch from req

  await createCBDeployment({
    id: identifier,
    clone_url,
    branch,
    rootDirectory,
    buildCommand,
    startCommand,
    port,
  });

  // TODO: do some database stuff here and update users deployment

  return new CustomResponse("Deployment Queued");
}
