import { Card, Typography, Button, Stack } from "@mui/material";
import { useDrag } from "react-dnd";

interface Task {
  id: number;
  task_name: string;
  status: string;
  created_at: string;
  end_date: string;
  project_id: number;
}

interface KanbanCardProps {
  task: Task;
  edit: (task: Task) => void;
  handleDelete: (taskId: number) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, edit, handleDelete }) => {
  const ITEM_TYPE = "TASK";
  const [{ isDragging }, dragRef] = useDrag({
    type: ITEM_TYPE,
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <Card
      component="div"
      ref={dragRef}
      sx={{
        padding: 2,
        marginBottom: 2,
        backgroundColor: isDragging ? "grey.300" : "white",
        cursor: "grab",
        boxShadow: isDragging ? 3 : 1,
        opacity: isDragging ? 0.6 : 1,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1 }}>
        {task.task_name}
      </Typography>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button 
          variant="contained" 
          color="primary" 
          size="small" 
          onClick={() => edit(task)}
        >
          Edit
        </Button>
        
        <Button 
          variant="contained" 
          color="error" 
          size="small" 
          onClick={() => handleDelete(task.id)}
        >
          Delete
        </Button>
      </Stack>
    </Card>
  );
};

export default KanbanCard;
