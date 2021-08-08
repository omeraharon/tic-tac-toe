import { Component, SyntheticEvent } from "react";
import { BoxModel } from "../../Models/BoxModel";
import { Modal, Button } from "react-bootstrap";
import SocketService from "../../Services/SocketService";
import "./Home.css"; 

interface HomeState {
    gameArr: BoxModel[];
    box: BoxModel;
    winnerObj: any;
    isOpen: boolean;
    playersArr: any
}

class Home extends Component<{}, HomeState> {

    private playerTurn: any = [];
    private SocketService: SocketService = new SocketService();

    public constructor(props: {}) {
        super(props);
        this.state = {
            box: null,
            gameArr: [],
            winnerObj: {
                win: false,
                player: ""
            },
            playersArr: [],
            isOpen: false,
        }
    }

    public async componentDidMount() {
        this.newGame();
        this.SocketService.connect(); 
        this.SocketService.socket.on("send-player-id-from-server", clients => this.setState({playersArr: clients}));
        this.SocketService.socket.on("send-selection-from-server", selection => this.setState({gameArr: selection}));
        this.SocketService.socket.on("send-winner-from-server", winner => {
            this.setState({winnerObj: winner})
            this.openModal();
            this.newGame();
        });
    }

    private newGame = async () => {
        const arr = [];

        for (let i = 0; i < 9; i++) {
            await this.setState({ box: new BoxModel() })
            arr.push(this.state.box);
        }
        return this.setState({ gameArr: arr })
    }

    public sendSelection = async (event: SyntheticEvent) => {
        this.setState({ winnerObj: { win: false, player: "" } });  

        if(this.state.playersArr.length > 1) {
            const currentBox = this.state.gameArr.find((obj: any) => obj.id === event.currentTarget.id);
            if (currentBox.isChecked) return;
            currentBox.isChecked = true;

            const index = this.state.gameArr.findIndex((obj: any) => obj.id === event.currentTarget.id);
            const arr = [...this.state.gameArr];

            currentBox.checkedRival = await this.getLastChecked();
            arr[index] = currentBox;

            this.setState({ gameArr: arr });
            this.SocketService.send(this.state.gameArr);
            this.checkWinner();
        } 
    }


    private getLastChecked = async () => {
        const arr = [...this.state.gameArr];
        let x = 0;
        let o = 0;

        for (let i = 0; i < arr.length; i++) {
            if (arr[i].checkedRival === "X") x = x + 1;
            if (arr[i].checkedRival === "O") o = o + 1;
        }

        if (x > o) return "O";
        if (o > x) return "X";
        if (x === o) return "X";
        if (x === 0) return "X";
    }

    private checkWinner = () => {
        const { gameArr } = this.state;

        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];

        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];

            if (gameArr[a].checkedRival === "X" && gameArr[b].checkedRival === "X" && gameArr[c].checkedRival === "X") {
                this.setState({ winnerObj: { win: true, player: "X" } });
                this.SocketService.sendWinner(this.state.winnerObj);
            }
            if (gameArr[a].checkedRival === "O" && gameArr[b].checkedRival === "O" && gameArr[c].checkedRival === "O") {
                this.setState({ winnerObj: { win: true, player: "O" } });
                this.SocketService.sendWinner(this.state.winnerObj);
            }
        }
    }

    openModal = () => this.setState({ isOpen: true });
    closeModal = () => this.setState({ isOpen: false });

    public render(): JSX.Element {
        return (
            <div className="Home">
                <div className="container">
                    {this.state.gameArr.map(obj =>
                        <div onClick={this.sendSelection} className="box" key={obj.id} id={obj.id}>
                            {obj.checkedRival}
                        </div> 
                    )}
                </div>

                <Modal show={this.state.isOpen} onHide={this.closeModal}>
                    <Modal.Body>{this.state.winnerObj.win && <div>{this.state.winnerObj.player} Is the Winner</div>}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.closeModal}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>

            </div>
        );
    }
}

export default Home;
