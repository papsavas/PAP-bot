import { courseTable, teacherTable, teacher_courseTable } from "../../../values/generic/DB.json";
import { deleteBatch, findAll, findOne, saveBatch } from "../../DB/GenericCRUD";
import { Course } from "../../Entities/KEP/Course";
import { Teacher } from "../../Entities/KEP/Teacher";
export function fetchCourses(returnings?: (keyof Course)[]) {
    return findAll(courseTable, true, returnings) as Promise<Course[]>;
}

export function addCourse(c: Course) {
    return saveBatch(courseTable, [c]);
}

export async function linkTeacherToCourse(teacherUsername: Teacher['username'], courseCode: Course['code']) {
    const teacher = await findOne(teacherTable, { "username": teacherUsername }) as Teacher;
    const course = await findOne(courseTable, { "code": courseCode }) as Course;
    return saveBatch(teacher_courseTable, [{ "course_id": course.uuid, "teacher_id": teacher.uuid }]);
}

export function deleteCourse(code: Course['code']) {
    return findOne(courseTable, { "code": code }, ['uuid']).then(async (course) => {
        //!order matters, otherwise "teacher_class" will be violating foreign key constraint, fixed with cascade
        await deleteBatch(teacher_courseTable, { "course_id": course['uuid'] });
        await deleteBatch(courseTable, { "uuid": course['uuid'] });
    });
}