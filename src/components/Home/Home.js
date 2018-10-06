import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Chip from '@material-ui/core/Chip';
import Hidden from '@material-ui/core/Hidden';
import Snackbar from '@material-ui/core/Snackbar';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
import deepPurple from '@material-ui/core/colors/deepPurple';
import lightBlue from '@material-ui/core/colors/lightBlue';
import grey from '@material-ui/core/colors/grey';
import yellow from '@material-ui/core/colors/yellow';
import AddProjectModal from '../AddProjectModal/AddProjectModal';
import AppService from '../../services/AppService';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  icon: {
    margin: theme.spacing.unit * 2,
    backgroundColor: deepPurple[700],
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: deepPurple[800],
    },
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
    position: 'absolute',
  },
  button: {
    backgroundColor: grey[200],
    '&:hover': {
      backgroundColor: grey[300],
    },
    color: lightBlue[500],
  },
  chip: {
    backgroundColor: yellow[500],
    color: grey[900],
    marginLeft: 18,
    fontWeight: 'bold',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 1.5px 2.5px 0 rgba(0, 0, 0, 0.19)',
    height: '2.5em',
    fontSize: '0.825em'
  },
});

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingProjects: true,
      modalOpen: false,
      snackbarOpen: false,
      initialProjects: [],
      projects: [],
      snackbarText: '',
    };
    this.addProject = this.addProject.bind(this);
    this.modalClosed = this.modalClosed.bind(this);
    this.fetchProjects = this.fetchProjects.bind(this);
    this.renderSnackbar = this.renderSnackbar.bind(this);
  }

  async componentWillMount() {
    this.fetchProjects();
  }

  async fetchProjects() {
    const projects = await AppService.getProjects();
    // sorting projects by earliest date created
    this.setState({ projects: [...projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
    this.setState({ initialProjects: projects });
    this.setState({ loadingProjects: false });
  }

  addProject() {
    console.log('button clicked');
    this.setState({ modalOpen: true });
  }

  modalClosed() {
    this.setState({ modalOpen: false });
    this.fetchProjects();
  }

  renderSnackbar({ snackbarText }) {
    this.setState({ snackbarOpen: true, snackbarText });
    setTimeout(() => {
      this.setState({ snackbarOpen: false });
    }, 5000);
  }

  filteredProjects = (event) => {
    var updatedProject = this.state.initialProjects;
    updatedProject = updatedProject.filter(function(item) {
      const query = event.target.value.toLowerCase();
      const tableContent = `${item.name}${item.description}${item.tech}`;

      return tableContent.toLowerCase().indexOf(query) >= 0;
    });
    this.setState({projects: updatedProject});
  }

  renderProjects() {
    const { projects, loadingProjects } = this.state;
    const { classes } = this.props;
    return (
      <Paper className={classes.root}>
        <TextField
          label="Search"
          className={classes.textField}
          margin="normal"
          style={{ marginLeft: '1em' }}
          onChange={this.filteredProjects}
        />
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <Hidden only={['xs', 'sm']}>
                <TableCell>Description</TableCell>
              </Hidden>
              <Hidden only={['xs', 'sm']}>
                <TableCell>Tech</TableCell>
              </Hidden>

              <TableCell>Project Page</TableCell>
            </TableRow>
          </TableHead>
          {!loadingProjects && (
            <TableBody>
              {
                projects.map(({
                  name, description, tech, createdAt,
                }) => {
                  const currentDate = new Date();
                  const projectDate = new Date(createdAt);
                  const timeDiff = Math.abs(currentDate.getTime() - projectDate.getTime());
                  const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                  return (
                    <TableRow key={name}>
                      {diffDays < 5
                        ? (
                          <TableCell>
                            {name}
                            <Chip className={classes.chip} label="NEW" />
                          </TableCell>
                        ) : <TableCell>{name}</TableCell>}
                       <Hidden only={['xs', 'sm']}>
                       <TableCell>{description}</TableCell>
                       </Hidden>
                       <Hidden only={['xs', 'sm']}>
                       <TableCell>{tech}</TableCell>
                       </Hidden>                      
                      <TableCell><Button className={classes.button} href={`/projects/${name}`}>View</Button></TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          )}
        </Table>
        {loadingProjects && <LinearProgress />}
      </Paper>
    );
  }

  render() {
    const { classes } = this.props;
    const { modalOpen, snackbarOpen, snackbarText } = this.state;
    return (
      <div className="Home">
        <div className="container">{this.renderProjects()}</div>
        <Button variant="fab" aria-label="Add" className={classes.icon} onClick={this.addProject}>
          <AddIcon />
        </Button>
        <AddProjectModal
          open={modalOpen}
          modalClosed={this.modalClosed}
          renderSnackbar={this.renderSnackbar}
        />
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          open={snackbarOpen}
          autoHideDuration={5000}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={(
            <span id="message-id">
              {snackbarText}
            </span>
            )}
        />
      </div>
    );
  }
}

export default withStyles(styles)(Home);
