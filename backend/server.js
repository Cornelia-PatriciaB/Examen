"use strict"
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const port=process.env.PORT || 8080;
const application = express();
application.use(cors())
application.use(bodyParser.json())
const sequelize = require("./sequelize");
//Import tabele
const Spacecraft = require("./tabele/spacecraft");
const Astronaut = require("./tabele/astronaut");

//Relatii intre tabele
Spacecraft.hasMany(Astronaut, { foreignKey: "id_spacecraft" });

application.use(
    express.urlencoded({
        extended: true,
    })
);
application.use(express.json());

application.listen(port, () => {
    console.log(`The server is running on http://localhost: ${port} `);
});

application.use((err, req, res, next) => {
    console.error("[ERROR]:" + err);
    res.stats(500).json({message: "500 Server Error"});
});

//Baza de date 
application.get("/create", async (req, res, next) => {
    try {
      await sequelize.sync({ force: true });
      res.status(201).json({ message: "Baza de date a fost realizata cu succes."});
    } catch (error) {
      next(error);
    }
});

//Operatii

//SPACECRAFT

//GET = pentru prima entitate 
application.get("/spacecrafts", async (request, response, next) => {
     try
     {
        const Op = require("sequelize").Op;
        const query = {};
        let pageSize = 2;
        const allowedFilters = ["nume", "viteza_maxima"];
        const filterKeys = Object.keys(request.query).filter(
            (e) => allowedFilters.indexOf(e) !== -1
        );
        if (filterKeys.length > 0) {
            query.where = {};

            for (const key of filterKeys) {
                if (isNaN(request.query[key]) == true) {
                    query.where[key] = { [Op.like]: `%${request.query[key]}%` };
                }
                else {
                    query.where[key] = {
                        [Op.eq]: parseFloat(request.query[key]),
                    };
                }
            }
        }
        if (request.query.pageSize) {
           pageSize = parseInt(request.query.pageSize);
           }
    //sortare dupa un camp
    if(request.query.sortField){
      const sortField=request.query.sortField
      const sortOrder=request.query.sortOrder ? request.query.sortOrder : 'ASC'
      query.order=[[sortField,sortOrder]]
    }
    //paginarea
    if (!isNaN(parseInt(request.query.page))) {
      query.limit = pageSize; 
      query.offset = pageSize * parseInt(request.query.page); 
    }
    const records = await Spacecraft.findAll(query);
    const count = await Spacecraft.count();
    response.status(200).json({ records, count });
  } catch (e) {
    console.warn(e);
    response.status(500).json({ message: "error" });
  }
});

//GET = pentru prima entitate = afisarea pentru un anumit spacecraft
application.get("/spacecrafts/:spacecraftId", async (request, response, next) => {
    try {
      const spacecraft = await Spacecraft.findByPk(request.params.spacecraftId);
      if (spacecraft) {
        response.status(200).json(spacecraft);
      } else {
        response.status(404).json({
          error: `Spacecraft cu id: ${request.params.spacecraftId} nu a fost gasit`,
        });
      }
    } catch (err) {
      next(err);
    }
  });

//POST = pentru prima entitate = adaugare spacecraft in baza de date
application.post("/spacecrafts", async (request, response, next) => {
    try {
      const spacecraft = await Spacecraft.create(request.body);
      response.status(201).json({ message: "Spacecraft a fost adaugat in baza de date" });
    } catch (error) {
      next(error);
    }
});

//PUT = pentru prima entitate = actualizare spacecraft
application.put("/spacecrafts/:spacecraftId", async (request, response, next) => {
    try {
      const spacecraft = await Spacecraft.findByPk(request.params.spacecraftId);
      if (spacecraft) {
        await spacecraft.update(request.body);
        response.status(200).json({
          message: `Spacecraft cu id: ${request.params.spacecraftId} a fost actualizat`,
        });
      } else {
        response.status(404).json({
          error: `Spacecraft cu id: ${request.params.spacecraftId} nu a fost gasit`,
        });
      }
    } catch (err) {
      next(err);
    }
  }); 

//DELETE = pentru prima entitate = stergere
application.delete("/spacecrafts/:spacecraftId", async (request, response, next) => {
    try {
      const spacecraft = await Spacecraft.findByPk(request.params.spacecraftId);
      if (spacecraft) {
        await spacecraft.destroy();
        response.status(200).json({
          message: `Spacecraft cu id: ${request.params.spacecraftId} a fost sters`,
        });
      } else {
        response.status(404).json({
          error: `Spacecraft cu id: ${request.params.spacecraftId} nu a fost gasit`,
        });
      }
    } catch (err) {
      next(err);
    }
  });

//ASTRONAUT

//GET = pentru a doua entitate = afisare astronauts pentru un spacecraft specificat
application.get("/spacecrafts/:spacecraftId/astronauts",async (req, res, next) => {
      try {
        const spacecraft = await Spacecraft.findByPk(req.params.spacecraftId);
        if (spacecraft) {
          const records = await spacecraft.getAstronauts();
          if (records.length > 0) {
            res.status(200).json({records});
          } else {
            res.sendStatus(204);
          }
        } else {
          res.sendStatus(404);
        }
      } catch (error) {
        next(error);
      }
    }
  );

//GET = pentru a doua entitate = preluarea astronaut dintr-un spacecraft
application.get("/spacecrafts/:spacecraftId/astronauts/:astronautId", async (req, res, next) => {
      try {
        const spacecraft = await Spacecraft.findByPk(req.params.spacecraftId);
        if (spacecraft) {
          const astronauts = await spacecraft.getAstronauts({
            where: { id: req.params.astronautId },
          });
          const astronaut = astronauts.shift();
          if (astronaut) {
            res.status(200).json(astronaut);
          } else {
            res.sendStatus(404);
          }
        } else {
          res.status(404).json({
            error: `Astronautul cu id: ${req.params.astronautId} nu a fost gasit`,
          });
        }
      } catch (err) {
        next(error);
      }
    }
  );

//POST = pentru a doua entitate = adaugare astronaut la spacecraft
application.post("/spacecrafts/:spacecraftId/astronauts",async (req, res, next) => {
      try {
        const spacecraft = await Spacecraft.findByPk(req.params.spacecraftId);
        if (spacecraft) {
          const astronaut = await Astronaut.create(req.body);
          spacecraft.addAstronaut(astronaut);
          await spacecraft.save();
          res.status(200).json(astronaut);
        } else {
          res.sendStatus(404);
        }
      } catch (error) {
        next(error);
      }
    }
  );

//PUT = pentru a doua entitate = actualizare astronaut dintr-un spacecraft
application.put("/spacecrafts/:spacecraftId/astronauts/:astronautId",async (req, res, next) => {
     try {
        const spacecraft = await Spacecraft.findByPk(req.params.spacecraftId);
        if (spacecraft) {
          const astronauts = await spacecraft.getAstronauts({
            where: { id: req.params.astronautId },
          });
          const astronaut = astronauts.shift();
          if (astronaut) {
            await astronaut.update(req.body);
            res.status(200).json({
              message: `Astronautul cu id: ${req.params.astronautId} a fost actualizat`,
            });
          } else {
            res.status(404).json({
              error: `Astronautul cu id: ${req.params.astronautId} nu a fost gasit`,
            });
          }
        } else {
          response.sendStatus(404);
        }
      } catch (err) {
        next(err);
      }
    }
  );

//DELETE = pentru a doua entitate = operatia de stergere astronaut de la spacecraft
application.delete("/spacecrafts/:spacecraftId/astronauts/:astronautId",async (req, res, next) => {
      try {
        const spacecraft = await Spacecraft.findByPk(req.params.spacecraftId);
        if (spacecraft) {
          const astronauts = await spacecraft.getAstronauts({where: {id:req.params.astronautId},
        });
          const astronaut = astronauts.shift();
          if (astronaut) {
            await astronaut.destroy();
            res.status(200).json({
              message: `Astronautul cu id: ${req.params.astronautId} a fost sters`,
            });
          } else {
            res.status(404).json({
              error: `Astronautul cu id: ${req.params.astronautId} nu a fost gasit`,
            });
          }
        } else {
          res.status(404).json({
            error: `Astronautul cu id: ${req.params.astronautId} nu a fost gasit`,
          });
        }
      } catch (error) {
        next(error);
      }
    }
  );

//IMPORT
application.post("/import", async (req, res, next) => {
    try {
      const registry = {};
      for (let s of req.body) {
        const spacecraft = await Spacecraft.create(s);
        for (let a of s.astronauts) {
          const astronaut = await Astronaut.create(a);
          registry[a.key] = astronaut;
          spacecraft.addAstronaut(astronaut);
        }
        await spacecraft.save();
      }
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

//EXPORT
application.get("/export", async (req, res, next) => {
    try {
      const result = [];
      for (let s of await Spacecraft.findAll()) {
        const spacecraft = {
          nume: s.nume,
          viteza_maxima: s.viteza_maxima,
          masa: s.masa,
          astronauts: [],
        };
        for (let a of await s.getAstronauts()) {
          spacecraft.astronauts.push({
            key: a.id,
            nume: a.nume,
            rol: a.rol,
          });
        }
        result.push(spacecraft);
      }
      if (result.length > 0) {
        res.json(result);
      } else {
        res.sendStatus(204);
      }
    } catch (error) {
      next(error);
    }
});

