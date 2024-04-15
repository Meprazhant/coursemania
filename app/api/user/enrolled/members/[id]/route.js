import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import User from "@/app/lib/models/userModel";
import Enroll from "@/app/lib/models/enrollModel";
import Course from "@/app/lib/models/courseModel";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({
      status: "error",
      message: "You need to be signed in to do that",
      session,
    });
  }
  const email = session.user.email;
  const user = await User.findOne({ email });

  if (!user) {
    return Response.json({
      status: "error",
      message: "User not found",
    });
  }

  const courseExist = await Course.findById(params.id).populate("createdBy");
  if (!courseExist) {
    return Response.json({
      status: "error",
      message: "Course not found",
    });
  }

  const isEnrolled = await Enroll.find({
    course: params.id,
  }).populate("student");

  const isTeacher =
    courseExist.createdBy._id.toString() === user._id.toString();

  //check if user is the course creator or enrolled
  if (!isTeacher) {
    return Response.json({
      status: "error",
      message: "You can't view this course",
    });
  }

  return Response.json({
    status: "success",
    message: "User enrolled courses found",
    members: isEnrolled,
  });
}
