FROM golang:1.13-alpine

EXPOSE 8080
ENV PORT=8080

WORKDIR /go/src/app
COPY . .

RUN go get -d -v
RUN go install -v

CMD ["app"]