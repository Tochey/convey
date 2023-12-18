import { CustomResponse } from "../../utils/custom-res";
import { Request } from "../../types";
import { Github } from "../../lib/github";
import CustomError from "../../utils/custom-err";
import { createCBDeployment } from "../../lib/codebuild";
import * as UserDAL from "../../dal/user";
import { Deployment, IDeployment } from "@convey/shared";

export async function create(req: Request) {
  const { id } = req.ctx.decodedToken;
  const {
    name,
    url,
    branch,
    buildCommand,
    startCommand,
    rootDirectory,
    port,
    env,
  } = req.body;

  const dply: Partial<IDeployment> = {
    rootDirectory: rootDirectory || undefined,
    env: env || undefined,
    branch: branch || undefined,
  };

  const user = await UserDAL.getUser(id);

  const doesExist = await Deployment.findOne({
    user: user._id,
    github_url: url,
  });

  if (doesExist) {
    throw new CustomError(400, "Deployment already exists");
  }

  const gh = new Github(url);
  let info: Awaited<ReturnType<typeof gh.validate>>;

  try {
    info = await gh.validate();
  } catch (err: unknown) {
    throw new CustomError(400, (err as Error).message);
  }

  // this isnt needed for now, maybe add github project metadata?
  const {
    data: { clone_url },
  } = info;

  const deployment: IDeployment = await Deployment.create({
    user: user._id,
    github_url: url,
    name,
    buildCommand,
    startCommand,
    port,
    ...dply,
  });

  await createCBDeployment(deployment); // this can be offloaded to a lambda function if api res time starts to suffer

  return new CustomResponse("Deployment Queued", deployment, 201);
}

export async function list(req: Request) {
  const { id } = req.ctx.decodedToken;

  const user = await UserDAL.getUser(id);

  const deployments = await Deployment.find({ user: user._id });

  return new CustomResponse("Deployments", deployments);
}

export async function getLogs(req: Request) {
  const { id } = req.ctx.decodedToken;
  const { id: dplyId } = req.params;

  const user = await UserDAL.getUser(id);

  const deployment = await Deployment.findOne({
    _id: dplyId,
    user: user._id,
  });

  if (!deployment) {
    throw new CustomError(404, "Deployment not found");
  }

  return new CustomResponse("Logs", deployment.logs);
}
