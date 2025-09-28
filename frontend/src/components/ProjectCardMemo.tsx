import React, { memo } from 'react';
import { Project } from '../types';
import ProjectCard from './ProjectCard';

interface ProjectCardMemoProps {
  project: Project;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onDeleteWithTasks: (project: Project) => void;
}

/**
 * Memoized ProjectCard component to prevent unnecessary re-renders
 * Only re-renders when project data or handlers change
 */
const ProjectCardMemo: React.FC<ProjectCardMemoProps> = memo(({
  project,
  onView,
  onEdit,
  onDelete,
  onDeleteWithTasks
}) => {
  return (
    <ProjectCard
      project={project}
      onEdit={onEdit}
      onDelete={onDelete}
      onDeleteWithTasks={onDeleteWithTasks}
      onView={onView}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.project.id === nextProps.project.id &&
    prevProps.project.name === nextProps.project.name &&
    prevProps.project.status === nextProps.project.status &&
    prevProps.project.priority === nextProps.project.priority &&
    prevProps.project.description === nextProps.project.description &&
    prevProps.project.created_at === nextProps.project.created_at &&
    prevProps.project.updated_at === nextProps.project.updated_at
  );
});

ProjectCardMemo.displayName = 'ProjectCardMemo';

export default ProjectCardMemo;
