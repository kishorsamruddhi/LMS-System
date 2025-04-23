const express = require("express");
const Course = require("../models/Course.js");
const Module = require("../models/Module.js");
const Assessment = require("../models/Assessment.js");
const Pedagogy = require("../models/Pedagogy.js");
const BusinessCourses = require("../LearningModels/Training_Business.js");
const { default: mongoose } = require("mongoose");
const router = express.Router();

router.delete("/delete_course/:id", async (req, res) => {
  try {
    const course_id = req.params.id;

    if (!mongoose.isValidObjectId(course_id)) {
      res.status(404).json({
        error: true,
        data: "Course Id is not vaild",
      });
    }

    const resp = await deleteCoursesTree(course_id);

    res.status(200).json({
      error: false,
      data: resp,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      data: err.message,
    });
  }
});

router.delete("/delete_module/:id", async (req, res) => {
  try {
    const module_id = req.params.id;

    const data = await deleteModuleTree(module_id);
    res.status(200).json({
      error: false,
      data,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      data: err.message,
    });
  }
});

router.delete("/delete_assessment/:id", async (req, res) => {
  try {
    const assessment_id = req.params.id;

    const data = await deleteAssessmentTree(assessment_id);
    res.status(200).json({
      error: false,
      data,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      data: err.message,
    });
  }
});

router.delete("/delete_pedagogy/:id", async (req, res) => {
  try {
    const pedagogy_id = req.params.id;

    const data = await deletePedagogyTree(pedagogy_id);
    res.status(200).json({
      error: false,
      data,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      data: err.message,
    });
  }
});

module.exports = router;

async function deletePedagogyTree(pedagogy_id) {
  try {
    const getPedagogy = await Pedagogy.findById(pedagogy_id, {
      module_id: 1,
    }).lean();

    if (!getPedagogy) {
      throw new Error(`Pedagogy with ID ${pedagogy_id} not found`);
    }

    const deleteResp = await Pedagogy.findByIdAndDelete(pedagogy_id).lean();

    await Module.findByIdAndUpdate(getPedagogy.module_id, {
      $pull: { pedagogies: pedagogy_id },
    }).lean();

    return deleteResp;
  } catch (error) {
    console.error("Error deleting Pedagogy tree:", error.message);
    throw error;
  }
}

async function deleteAssessmentTree(assessment_id) {
  try {
    const getAssessment = await Assessment.findById(assessment_id, {
      module_id: 1,
    }).lean();

    if (!getAssessment) {
      throw new Error(`Assessment with ID ${assessment_id} not found`);
    }

    const deleteResp = await Assessment.findByIdAndDelete(assessment_id);

    await Module.findByIdAndUpdate(getAssessment.module_id, {
      $pull: { assessments: assessment_id },
    }).lean();

    return deleteResp;
  } catch (error) {
    console.error("Error deleting Assessment tree:", error.message);
    throw error;
  }
}

async function deleteModuleTree(module_id) {
  try {
    const getModule = await Module.findById(module_id, {
      assessments: 1,
      module_type: 1,
      pedagogies: 1,
      course_id: 1,
    }).lean();

    if (!getModule) {
      throw new Error(`Module with ID ${module_id} not found`);
    }

    const isAssessment = getModule.module_type === "ASSESSMENT";

    let deleteResp;
    if (isAssessment) {
      deleteResp = await Assessment.deleteMany({
        _id: { $in: getModule.assessments },
      });
    } else {
      deleteResp = await Pedagogy.deleteMany({
        _id: { $in: getModule.pedagogies },
      });
    }
    await Course.findByIdAndUpdate(getModule.course_id, {
      $pull: { modules: module_id },
    }).lean();

    return deleteResp;
  } catch (error) {
    console.error("Error deleting module tree:", error.message);
    throw error;
  }
}

async function deleteCoursesTree(course_id) {
  try {
    const getCourse = await Course.findById(course_id, {
      modules: 1,
      business_id: 1,
    }).lean();

    if (!getCourse) {
      throw new Error(`Course with ID ${course_id} not found`);
    }

    const deleteModulePromises = getCourse.modules.map(async (module) => {
      return await deleteModuleTree(module._id);
    });

    await Promise.all(deleteModulePromises);

    await Module.deleteMany({
      _id: { $in: getCourse.assessments },
    });

    const courseDeleteResp = await Course.findByIdAndDelete(course_id).lean();

    await BusinessCourses.findByIdAndUpdate(getCourse.business_id, {
      $pull: {
        courses: course_id,
      },
    });
    return courseDeleteResp;
  } catch (error) {
    console.error("Error deleting course tree:", error.message);
    throw error;
  }
}
