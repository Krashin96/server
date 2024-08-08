import { Router } from "express"
import { body, param } from "express-validator"
import { NoteController } from "../controllers/NoteController"
import { ProjectController } from "../controllers/ProjectController"
import { TaskController } from "../controllers/TaskController"
import { TeamController } from "../controllers/TeamController"
import { autenticate } from "../middleware/auth"
import { projectExists } from "../middleware/project"
import { hasAuthotization, taskBelongToProject, taskExists } from "../middleware/task"
import { handleInputErrors } from "../middleware/validation"

export const projectRoutes = Router()

projectRoutes.use(autenticate) //Validar JWT

// Crear Projecto
projectRoutes.post('/',
    //express validator
    body('projectName')
        .notEmpty().withMessage('El nombre del Proyecto es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del Cliente es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripción del Proyecto es obligatoria'),
    handleInputErrors,
    //controlador
    ProjectController.createProject
)

// Obtener todos los proyectos
projectRoutes.get('/', ProjectController.getAllProjects)

// Param ProjectID is a MongoID
projectRoutes.param('projectID', param('projectID').isMongoId().withMessage('ID no válido'))
projectRoutes.param('projectID', projectExists)

// Obtener proyecto por ID
projectRoutes.get('/:projectID',
    handleInputErrors,
    ProjectController.getProjectByID
)

// Modificar proyecto
projectRoutes.put('/:projectID',
    body('projectName')
        .notEmpty().withMessage('El nombre del Proyecto es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del Cliente es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripción del Proyecto es obligatoria'),
    handleInputErrors,
    ProjectController.updateProject
)

// Borrar proyecto
projectRoutes.delete('/:projectID',
    handleInputErrors,
    ProjectController.deleteProject
)

// Tasks --------------------------------------------->

// Crear Tarea
projectRoutes.post('/:projectID/tasks',
    hasAuthotization,
    body('name')
        .notEmpty().withMessage('El nombre de la Tarea es obligatoria'),
    body('description')
        .notEmpty().withMessage('La descripción de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.createTask
)

// Obtener todas las tareas
projectRoutes.get('/:projectID/tasks',
    handleInputErrors,
    TaskController.getAllTasks
)

// Param taskID is a MongoID
projectRoutes.param('taskID', param('taskID').isMongoId().withMessage('ID no válido'))
projectRoutes.param('taskID', taskExists)
projectRoutes.param('taskID', taskBelongToProject)


// Obtener tarea por ID
projectRoutes.get('/:projectID/tasks/:taskID',
    handleInputErrors,
    TaskController.getTaskByID
)

// Modificar Tarea
projectRoutes.put('/:projectID/tasks/:taskID',
    hasAuthotization,
    body('name')
        .notEmpty().withMessage('El nombre de la Tarea es obligatoria'),
    body('description')
        .notEmpty().withMessage('La descripción de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.updateTask
)

// Borrar Tarea
projectRoutes.delete('/:projectID/tasks/:taskID',
    hasAuthotization,
    handleInputErrors,
    TaskController.deleteTask
)

// Modificar Estado de la Tarea
projectRoutes.post('/:projectID/tasks/:taskID/status',
    body('status')
        .notEmpty().withMessage('El Status de la Tarea es obligatoria'),
    handleInputErrors,
    TaskController.updateStatus
)

// Team Routes ---------------------- >

// Buscar miembro por ID
projectRoutes.post('/:projectID/team/find',
    body('email')
        .isEmail().toLowerCase().withMessage('Correo no válido'),
    handleInputErrors,
    TeamController.findMemberByEmail
)

// Agregar miembro por ID
projectRoutes.post('/:projectID/team',
    body('id')
        .isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TeamController.addMemberByID
)

// Eliminar miembro
projectRoutes.delete('/:projectID/team/:userID',
    param('userID')
        .isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TeamController.deleteMember
)

// Obtener miembros
projectRoutes.get('/:projectID/team',
    handleInputErrors,
    TeamController.getMembers
)

// Notas -------------------------------------->

// Crear nota
projectRoutes.post('/:projectID/tasks/:taskID/notes',
    body('content').notEmpty().withMessage('El contenido de la nota es obligatorio'),
    handleInputErrors,
    NoteController.createNote
)

projectRoutes.get('/:projectID/tasks/:taskID/notes',
    NoteController.getTaskNotes
)

projectRoutes.delete('/:projectID/tasks/:taskID/notes/:noteID',
    param('noteID').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    NoteController.deleteNote
)