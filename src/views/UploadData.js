import { Row, Col, Card, CardBody, Button } from "reactstrap";
import "../assets/css/paper-dashboard.css"

function UploadData() {
    return (
        <>
            <div className="content">
                <Row>
                    <Col md="4">
                        <Card className="card-user">
                        <img
                            alt="..."
                            className="image-fit"
                            src={require("assets/img/localupload.png")}
                        />
                        <CardBody>
                        <div className="d-flex justify-content-center">
                            <Button color="info" ><i className="nc-icon nc-cloud-upload-94 icon-large" /> Upload data from local machine</Button>
                        </div>
                        </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    )
}

export default UploadData;